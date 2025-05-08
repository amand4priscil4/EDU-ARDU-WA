const arduinoService = require('../services/arduinoService');

class SocketHandler {
  constructor() {
    this.io = null;
    this.connections = new Map();
  }

  initialize(io) {
    if (this.io) {
      console.warn('Socket.IO already initialized');
      return;
    }

    this.io = io;
    this.setupSocketEvents();
    this.setupArduinoEvents();
  }

  setupSocketEvents() {
    this.io.on('connection', socket => {
      console.log(`New client connected: ${socket.id}`);

      // Adicionar à lista de conexões
      this.connections.set(socket.id, {
        id: socket.id,
        connectedAt: new Date()
      });

      // Enviar estado inicial
      socket.emit('robot:status', arduinoService.getStatus());

      // Manipular comandos do robô
      socket.on('robot:command', async data => {
        try {
          const { command } = data;
          console.log(`Received command from client ${socket.id}: ${command}`);

          await arduinoService.sendCommand(command);
        } catch (error) {
          console.error('Error handling robot command:', error);
          socket.emit('error', { message: error.message });
        }
      });

      // Manipular mensagens para o robô
      socket.on('robot:message', async data => {
        try {
          const { message } = data;
          console.log(`Received message from client ${socket.id}: ${message}`);

          // Formatar comando com prefixo SAY:
          const command = `SAY:${message}`;

          // Adicionar mensagem ao histórico local
          const messageObj = {
            id: Date.now(),
            text: message,
            sender: 'user',
            timestamp: new Date()
          };

          // Enviar a mensagem para todos os clientes para feedback imediato
          this.io.emit('chat:message', messageObj);

          // Enviar comando para o Arduino
          await arduinoService.sendCommand(command);
        } catch (error) {
          console.error('Error handling robot message:', error);
          socket.emit('error', { message: error.message });
        }
      });

      // Manipular upload de código para o Arduino
      socket.on('robot:upload_code', async data => {
        try {
          const { code } = data;
          console.log(`Received code upload from client ${socket.id} (${code.length} bytes)`);

          // Informar a todos os clientes que um upload está em andamento
          this.io.emit('robot:status-update', { 
            status: 'Iniciando upload de código...'
          });

          // Enviar código para o Arduino
          await arduinoService.uploadCode(code);
          
          // Notificar cliente sobre o sucesso do upload
          socket.emit('robot:code-uploaded', { success: true });
          
          // Informar a todos os clientes que o upload foi concluído
          this.io.emit('robot:status-update', { 
            status: 'Código carregado com sucesso!'
          });
        } catch (error) {
          console.error('Error uploading code to Arduino:', error);
          socket.emit('robot:code-uploaded', { 
            success: false, 
            message: error.message 
          });
          
          // Informar sobre o erro
          this.io.emit('robot:status-update', { 
            status: `Erro no upload: ${error.message}`
          });
        }
      });

      // Manipular pedido para conectar a uma porta específica
      socket.on('robot:connect', async data => {
        try {
          const { port } = data;
          console.log(`Client ${socket.id} requesting connection to port ${port}`);

          await arduinoService.connect(port);

          // O status será enviado através do event listener do Arduino
        } catch (error) {
          console.error('Error connecting to port:', error);
          socket.emit('error', { message: error.message });
        }
      });

      // Manipular desconexão do robô
      socket.on('robot:disconnect', async () => {
        try {
          console.log(`Client ${socket.id} requesting disconnection from robot`);

          await arduinoService.disconnect();

          // O status será enviado através do event listener do Arduino
        } catch (error) {
          console.error('Error disconnecting from robot:', error);
          socket.emit('error', { message: error.message });
        }
      });

      // Manipular desconexão do cliente
      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        this.connections.delete(socket.id);
      });
    });
  }

  setupArduinoEvents() {
    // Evento de conexão do Arduino
    arduinoService.on('connected', () => {
      console.log('Arduino connected event - notifying all clients');
      this.io.emit('robot:status', arduinoService.getStatus());
    });

    // Evento de desconexão do Arduino
    arduinoService.on('disconnected', () => {
      console.log('Arduino disconnected event - notifying all clients');
      this.io.emit('robot:status', arduinoService.getStatus());
    });

    // Evento de erro do Arduino
    arduinoService.on('error', error => {
      console.log('Arduino error event - notifying all clients');
      this.io.emit('robot:error', { message: error.message });
    });

    // Evento de status do Arduino
    arduinoService.on('status', status => {
      console.log(`Arduino status event: ${status}`);
      this.io.emit('robot:status-update', { status });
    });

    // Evento de resposta do Arduino
    arduinoService.on('reply', reply => {
      console.log(`Arduino reply event: ${reply}`);

      // Criar objeto de mensagem
      const messageObj = {
        id: Date.now(),
        text: reply,
        sender: 'robot',
        timestamp: new Date()
      };

      // Enviar para todos os clientes
      this.io.emit('chat:message', messageObj);
    });

    // Evento de erro específico do Arduino
    arduinoService.on('arduino-error', error => {
      console.log(`Arduino specific error: ${error}`);
      this.io.emit('robot:arduino-error', { message: error });
    });

    // Evento de dados genéricos do Arduino
    arduinoService.on('data', data => {
      console.log(`Arduino data event: ${data}`);
      this.io.emit('robot:data', { data });
    });

    // Evento de progresso de upload
    arduinoService.on('upload-progress', progress => {
      console.log(`Arduino upload progress: ${progress.percent}%`);
      this.io.emit('robot:upload-progress', progress);
    });
  }

  // Métodos auxiliares para manipulação de clientes
  getConnectedClients() {
    return Array.from(this.connections.values());
  }

  broadcastMessage(event, data) {
    if (!this.io) {
      console.warn('Socket.IO not initialized, cannot broadcast');
      return;
    }

    this.io.emit(event, data);
  }
}

// Singleton
const socketHandler = new SocketHandler();
module.exports = socketHandler;