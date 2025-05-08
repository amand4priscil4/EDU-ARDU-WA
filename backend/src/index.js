require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const apiRoutes = require('./routes/api');
const socketHandler = require('./socket/socketHandler');
const arduinoService = require('./services/arduinoService');

// Inicializar Express
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Configurar middleware
app.use(cors());
app.use(express.json());

// Rotas estáticas
app.use(express.static('public'));

// Rotas da API
app.use('/api', apiRoutes);

// Rota de saúde da API
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Edu-Ardu API is running' });
});

// Configurar Socket.io
socketHandler.initialize(io);

// Inicializar serviço Arduino
arduinoService
  .initialize()
  .then(() => {
    console.log('Arduino service initialized');
  })
  .catch(err => {
    console.error('Failed to initialize Arduino service:', err.message);
    console.log('The application will continue to run without Arduino connection');
  });

// Iniciar servidor
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Health check: http://localhost:${PORT}/health`);
});

// Tratamento de erros não capturados
process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Limpeza na saída
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await arduinoService.disconnect();
  process.exit(0);
});
