import { createContext } from 'react';

// Contexto para o socket
export const SocketContext = createContext({
  socket: null,
  robotStatus: {
    connected: false,
    simulationMode: false,
    port: null
  }
});

// Função auxiliar para enviar comandos via socket
export const sendSocketCommand = (socket, command) => {
  if (!socket) {
    console.error('Socket não inicializado');
    return false;
  }

  console.log(`Enviando comando: ${command}`);
  socket.emit('robot:command', { command });
  return true;
};

// Função auxiliar para enviar mensagens via socket
export const sendSocketMessage = (socket, message) => {
  if (!socket) {
    console.error('Socket não inicializado');
    return false;
  }

  console.log(`Enviando mensagem: ${message}`);
  socket.emit('robot:message', { message });
  return true;
};

// Função auxiliar para conectar a uma porta via socket
export const connectToPortViaSocket = (socket, port) => {
  if (!socket) {
    console.error('Socket não inicializado');
    return false;
  }

  console.log(`Solicitando conexão à porta: ${port}`);
  socket.emit('robot:connect', { port });
  return true;
};

// Função auxiliar para desconectar via socket
export const disconnectViaSocket = socket => {
  if (!socket) {
    console.error('Socket não inicializado');
    return false;
  }

  console.log('Solicitando desconexão');
  socket.emit('robot:disconnect');
  return true;
};
