const arduinoService = require('../services/arduinoService');

/**
 * Controlador para operações relacionadas ao robô
 */
const robotController = {
  /**
   * Obter status atual do robô
   */
  getStatus: async (req, res) => {
    try {
      const status = arduinoService.getStatus();
      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      console.error('Error getting robot status:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao obter status do robô'
      });
    }
  },

  /**
   * Enviar comando para o robô
   */
  sendCommand: async (req, res) => {
    try {
      const { command } = req.body;

      if (!command) {
        return res.status(400).json({
          success: false,
          error: 'Comando não fornecido'
        });
      }

      // Validar comando
      const validCommands = ['FORWARD', 'BACKWARD', 'LEFT', 'RIGHT', 'STOP', 'DEMO'];
      const isCustomCommand = command.startsWith('SAY:');

      if (!validCommands.includes(command) && !isCustomCommand) {
        return res.status(400).json({
          success: false,
          error: 'Comando inválido'
        });
      }

      // Enviar comando para o Arduino
      const result = await arduinoService.sendCommand(command);

      res.json({
        success: true,
        data: {
          command,
          sent: result
        }
      });
    } catch (error) {
      console.error('Error sending robot command:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao enviar comando para o robô'
      });
    }
  },

  /**
   * Enviar mensagem/pergunta para o robô
   */
  sendMessage: async (req, res) => {
    try {
      const { message } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Mensagem não fornecida ou inválida'
        });
      }

      // Formatar comando com prefixo SAY:
      const command = `SAY:${message}`;

      // Enviar comando para o Arduino
      const result = await arduinoService.sendCommand(command);

      // Retornar sucesso imediatamente
      // A resposta real virá através do socket.io
      res.json({
        success: true,
        data: {
          message,
          sent: result
        }
      });
    } catch (error) {
      console.error('Error sending message to robot:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao enviar mensagem para o robô'
      });
    }
  },

  /**
   * Fazer upload de código para o Arduino
   */
  uploadCode: async (req, res) => {
    try {
      const { code } = req.body;

      if (!code || typeof code !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Código não fornecido ou inválido'
        });
      }

      // Enviar código para o Arduino
      const result = await arduinoService.uploadCode(code);

      res.json({
        success: true,
        data: {
          codeLength: code.length,
          uploaded: result
        }
      });
    } catch (error) {
      console.error('Error uploading code to robot:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao enviar código para o robô'
      });
    }
  },

  /**
   * Conectar a uma porta serial específica
   */
  connect: async (req, res) => {
    try {
      const { port } = req.body;

      if (!port) {
        return res.status(400).json({
          success: false,
          error: 'Porta não fornecida'
        });
      }

      // Conectar à porta especificada
      await arduinoService.connect(port);

      res.json({
        success: true,
        data: {
          connected: arduinoService.isConnected,
          port
        }
      });
    } catch (error) {
      console.error('Error connecting to port:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao conectar à porta serial'
      });
    }
  },

  /**
   * Desconectar do robô
   */
  disconnect: async (req, res) => {
    try {
      await arduinoService.disconnect();

      res.json({
        success: true,
        data: {
          disconnected: true
        }
      });
    } catch (error) {
      console.error('Error disconnecting from robot:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao desconectar do robô'
      });
    }
  },

  /**
   * Listar portas seriais disponíveis
   */
  listPorts: async (req, res) => {
    try {
      const { SerialPort } = require('serialport');
      const ports = await SerialPort.list();

      res.json({
        success: true,
        data: ports
      });
    } catch (error) {
      console.error('Error listing serial ports:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao listar portas seriais'
      });
    }
  },

  /**
   * Ativar modo de simulação
   */
  enableSimulation: async (req, res) => {
    try {
      // Desconectar se estiver conectado
      if (arduinoService.isConnected && !arduinoService.isSimulationMode) {
        await arduinoService.disconnect();
      }

      // Forçar modo de simulação
      arduinoService.isSimulationMode = true;
      arduinoService.startSimulation();

      res.json({
        success: true,
        data: {
          simulationMode: true
        }
      });
    } catch (error) {
      console.error('Error enabling simulation mode:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao ativar modo de simulação'
      });
    }
  }
};

module.exports = robotController;