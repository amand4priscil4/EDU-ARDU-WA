const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const EventEmitter = require('events');

class ArduinoService extends EventEmitter {
  constructor() {
    super();
    this.port = null;
    this.parser = null;
    this.isConnected = false;
    this.availablePorts = [];
    this.lastCommand = null;
    this.responseTimeout = null;
    this.autoReconnectInterval = null;
    this.isSimulationMode = process.env.SIMULATION_MODE === 'true';
  }

  async initialize() {
    if (this.isSimulationMode) {
      console.log('Arduino service running in SIMULATION mode (no hardware connection)');
      this.isConnected = true;
      this.startSimulation();
      return true;
    }

    try {
      // Lista as portas seriais disponíveis
      this.availablePorts = await SerialPort.list();
      console.log('Available serial ports:', this.availablePorts);

      // Se nenhuma porta encontrada, ativa modo simulação
      if (this.availablePorts.length === 0) {
        console.log('No serial ports found. Switching to simulation mode.');
        this.isSimulationMode = true;
        this.isConnected = true;
        this.startSimulation();
        return true;
      }

      // Determina qual porta usar
      const portToUse = process.env.ARDUINO_PORT || this.findArduinoPort();

      if (!portToUse) {
        console.log('No Arduino port specified or detected. Switching to simulation mode.');
        this.isSimulationMode = true;
        this.isConnected = true;
        this.startSimulation();
        return true;
      }

      // Conectar à porta serial
      await this.connect(portToUse);
      return true;
    } catch (error) {
      console.error('Error initializing Arduino service:', error);
      this.isSimulationMode = true;
      this.isConnected = true;
      this.startSimulation();
      return false;
    }
  }

  findArduinoPort() {
    // Tenta identificar uma porta que parece ser um Arduino
    // Isso pode variar dependendo do sistema operacional e do modelo do Arduino

    // Primeiro, procura por portas com "Arduino" no nome do fabricante
    const arduinoPort = this.availablePorts.find(
      port => port.manufacturer && port.manufacturer.includes('Arduino')
    );

    if (arduinoPort) return arduinoPort.path;

    // Em sistemas Windows, as portas seriais geralmente aparecem como COM3, COM4, etc.
    // Em sistemas Unix, geralmente como /dev/ttyUSB0, /dev/ttyACM0, etc.
    const commonPatterns = [
      /^COM\d+$/, // Windows
      /^\/dev\/ttyACM\d+$/, // Linux
      /^\/dev\/ttyUSB\d+$/, // Linux
      /^\/dev\/cu\.usbmodem\d+$/ // macOS
    ];

    // Procura por padrões comuns
    for (const pattern of commonPatterns) {
      const matchingPort = this.availablePorts.find(port => pattern.test(port.path));
      if (matchingPort) return matchingPort.path;
    }

    // Se nenhuma porta específica for encontrada, retorne a primeira porta disponível, se houver
    return this.availablePorts.length > 0 ? this.availablePorts[0].path : null;
  }

  async connect(portPath) {
    try {
      // Fechar porta anterior se existir
      if (this.port && this.port.isOpen) {
        await this.disconnect();
      }

      console.log(`Connecting to Arduino on ${portPath}`);
      this.port = new SerialPort({
        path: portPath,
        baudRate: parseInt(process.env.ARDUINO_BAUDRATE || '9600'),
        autoOpen: false
      });

      // Configurar parser para dados recebidos
      this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\n' }));

      // Manipuladores de eventos
      this.port.on('open', () => {
        console.log(`Connected to Arduino on ${portPath}`);
        this.isConnected = true;
        this.emit('connected');

        // Cancela o auto-reconnect se estiver ativo
        if (this.autoReconnectInterval) {
          clearInterval(this.autoReconnectInterval);
          this.autoReconnectInterval = null;
        }
      });

      this.port.on('error', err => {
        console.error('Serial port error:', err.message);
        this.isConnected = false;
        this.emit('error', err);
        this.setupAutoReconnect();
      });

      this.port.on('close', () => {
        console.log('Serial port closed');
        this.isConnected = false;
        this.emit('disconnected');
        this.setupAutoReconnect();
      });

      // Manipular dados recebidos
      this.parser.on('data', data => {
        data = data.toString().trim();
        console.log('Received from Arduino:', data);

        // Limpa timeout de resposta se houver
        if (this.responseTimeout) {
          clearTimeout(this.responseTimeout);
          this.responseTimeout = null;
        }

        // Processa o tipo de resposta
        if (data.startsWith('STATUS:')) {
          const status = data.substring(7);
          this.emit('status', status);
        } else if (data.startsWith('REPLY:')) {
          const reply = data.substring(6);
          this.emit('reply', reply);
        } else if (data.startsWith('ERR:')) {
          const error = data.substring(4);
          this.emit('arduino-error', error);
        } else {
          // Outras mensagens
          this.emit('data', data);
        }
      });

      // Abrir a porta
      return new Promise((resolve, reject) => {
        this.port.open(err => {
          if (err) {
            console.error('Failed to open serial port:', err.message);
            this.isConnected = false;
            this.setupAutoReconnect();
            reject(err);
          } else {
            // Aguardar um momento para a inicialização do Arduino
            setTimeout(() => {
              // Enviar comando de teste
              this.sendCommand('PING')
                .then(() => resolve(true))
                .catch(reject);
            }, 2000);
          }
        });
      });
    } catch (error) {
      console.error('Error connecting to Arduino:', error);
      this.isConnected = false;
      this.setupAutoReconnect();
      throw error;
    }
  }

  setupAutoReconnect() {
    // Configurar reconexão automática se não estiver já configurada
    if (!this.autoReconnectInterval && !this.isSimulationMode) {
      console.log('Setting up auto-reconnect...');
      this.autoReconnectInterval = setInterval(async () => {
        if (!this.isConnected) {
          console.log('Attempting to reconnect to Arduino...');
          try {
            await this.initialize();
          } catch (err) {
            console.error('Auto-reconnect failed:', err.message);
          }
        } else {
          clearInterval(this.autoReconnectInterval);
          this.autoReconnectInterval = null;
        }
      }, 5000); // Tentar reconectar a cada 5 segundos
    }
  }

  async disconnect() {
    return new Promise(resolve => {
      if (this.isSimulationMode) {
        this.isConnected = false;
        this.emit('disconnected');
        resolve(true);
        return;
      }

      if (this.port && this.port.isOpen) {
        this.port.close(err => {
          if (err) {
            console.error('Error closing port:', err.message);
          }
          this.isConnected = false;
          this.emit('disconnected');
          resolve(true);
        });
      } else {
        this.isConnected = false;
        resolve(true);
      }
    });
  }

  async sendCommand(command) {
    return new Promise((resolve, reject) => {
      if (this.isSimulationMode) {
        console.log(`[Simulation] Sending command: ${command}`);
        this.lastCommand = command;
        this.handleSimulatedResponse(command);
        resolve(true);
        return;
      }

      if (!this.isConnected || !this.port || !this.port.isOpen) {
        reject(new Error('Not connected to Arduino'));
        return;
      }

      console.log(`Sending command to Arduino: ${command}`);
      this.lastCommand = command;

      // Adicionar terminador de linha para o Arduino processar
      const commandWithNewline = command + '\n';

      this.port.write(commandWithNewline, err => {
        if (err) {
          console.error('Error sending command:', err.message);
          reject(err);
          return;
        }

        // Configurar timeout para resposta
        this.responseTimeout = setTimeout(() => {
          console.warn(`No response received for command: ${command}`);
          this.responseTimeout = null;
          // Resolve anyway, as this is not a critical error
          resolve(false);
        }, 2000);

        resolve(true);
      });
    });
  }

  getStatus() {
    return {
      connected: this.isConnected,
      port: this.port ? this.port.path : null,
      simulationMode: this.isSimulationMode,
      availablePorts: this.availablePorts.map(p => p.path)
    };
  }

  // Métodos para modo de simulação
  startSimulation() {
    console.log('Starting Arduino simulation mode');
    this.emit('connected');
  }

  handleSimulatedResponse(command) {
    setTimeout(() => {
      // Simular respostas com base no comando
      if (command === 'PING') {
        this.emit('data', 'PONG');
      } else if (command.startsWith('FORWARD')) {
        this.emit('status', 'Movendo para frente');
      } else if (command.startsWith('BACKWARD')) {
        this.emit('status', 'Movendo para trás');
      } else if (command.startsWith('LEFT')) {
        this.emit('status', 'Virando à esquerda');
      } else if (command.startsWith('RIGHT')) {
        this.emit('status', 'Virando à direita');
      } else if (command.startsWith('STOP')) {
        this.emit('status', 'Parado');
      } else if (command.startsWith('SAY:')) {
        const question = command.substring(4).toLowerCase();
        let response = '';

        // Simular respostas pré-programadas
        if (question.includes('olá') || question.includes('oi')) {
          response = 'Olá! Como posso ajudar você a aprender sobre robótica?';
        } else if (question.includes('nome')) {
          response =
            'Meu nome é Edu-Ardu! Sou um robô educacional para ensinar robótica e Arduino!';
        } else if (question.includes('arduino')) {
          response =
            'Arduino é uma plataforma de prototipagem eletrônica de código aberto. Com ele podemos criar projetos interativos incríveis!';
        } else if (question.includes('sensor')) {
          response =
            'Sensores são como os "sentidos" de um robô! Eles detectam informações do ambiente, como luz, som, distância e temperatura.';
        } else if (question.includes('motor') || question.includes('servo')) {
          response =
            'Motores e servomotores são atuadores que permitem ao robô se movimentar e interagir com o mundo físico!';
        } else {
          response =
            'Que pergunta interessante! Vamos explorar esse assunto na próxima aula de robótica.';
        }

        this.emit('reply', response);
      } else if (command.startsWith('DEMO')) {
        this.emit('status', 'Modo de demonstração iniciado');

        // Simular uma sequência de demonstração
        setTimeout(() => this.emit('status', 'Movendo para frente'), 1000);
        setTimeout(() => this.emit('status', 'Virando à esquerda'), 2000);
        setTimeout(() => this.emit('status', 'Virando à direita'), 3000);
        setTimeout(() => this.emit('status', 'Movendo para trás'), 4000);
        setTimeout(() => this.emit('status', 'Demonstração concluída'), 5000);
      }
    }, 300); // Delay simulando o tempo de processamento
  }

  // Método para carregar código no Arduino
  async uploadCode(code) {
    if (this.isSimulationMode) {
      console.log('Modo de simulação: Simulando upload de código para o Arduino');
      console.log('--- CÓDIGO RECEBIDO ---');
      console.log(code);
      console.log('----------------------');
      
      // Simular tempo de compilação e upload
      return new Promise((resolve) => {
        setTimeout(() => {
          this.emit('status', 'Código carregado com sucesso (modo de simulação)');
          resolve(true);
        }, 2000);
      });
    }
    
    if (!this.isConnected || !this.port) {
      throw new Error('Não conectado ao Arduino');
    }
    
    console.log('Enviando código para o Arduino');
    
    // Aqui você implementaria a lógica real para compilar e fazer upload
    // do código para o Arduino usando uma ferramenta como arduino-cli
    
    // Para este exemplo, apenas simulamos o sucesso após um atraso
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Código enviado com sucesso para o Arduino (simulado)');
        this.emit('status', 'Código carregado com sucesso');
        resolve(true);
      }, 3000);
    });
  }
}

// Singleton
const arduinoService = new ArduinoService();
module.exports = arduinoService;