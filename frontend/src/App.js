import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { io } from 'socket.io-client';

// Components
import Header from './components/Header';

// Pages
import HomePage from './pages/HomePage';
import LessonPage from './pages/LessonPage';
import RobotControlPage from './pages/RobotControlPage';
import RobotChatPage from './pages/RobotChatPage';
import BlockProgrammingPage from './pages/BlockProgrammingPage'; // Importando a nova página

// Context
import { SocketContext } from './services/socket';

// Styles
import './styles/App.css';

// API
import { getStatus } from './services/api';

function App() {
  const [socket, setSocket] = useState(null);
  const [robotStatus, setRobotStatus] = useState({
    connected: false,
    simulationMode: false,
    port: null
  });

  // Inicializar socket para comunicação em tempo real
  useEffect(() => {
    // Conexão com o backend
    const socketInstance = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    // Eventos do socket
    socketInstance.on('connect', () => {
      console.log('Connected to socket server');
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    socketInstance.on('robot:status', status => {
      console.log('Robot status update:', status);
      setRobotStatus(status);
    });

    socketInstance.on('error', error => {
      console.error('Socket error:', error);
      // Implementar notificação de erro aqui
    });

    setSocket(socketInstance);

    // Limpeza ao desmontar
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  // Obter status inicial do robô
  useEffect(() => {
    const fetchRobotStatus = async () => {
      try {
        const response = await getStatus();
        if (response.success) {
          setRobotStatus(response.data);
        }
      } catch (error) {
        console.error('Error fetching robot status:', error);
        // Implementar notificação de erro aqui
      }
    };

    fetchRobotStatus();
  }, []);

  return (
    <SocketContext.Provider value={{ socket, robotStatus }}>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/lessons/:id" element={<LessonPage />} />
            <Route path="/robot" element={<RobotControlPage />} />
            <Route path="/robot-chat" element={<RobotChatPage />} />
            <Route path="/block-programming" element={<BlockProgrammingPage />} /> {/* Nova rota */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <footer className="app-footer">
          <div className="container">
            <p>© 2025 Edu-Ardu - Robótica Educacional</p>
          </div>
        </footer>
      </div>
    </SocketContext.Provider>
  );
}

export default App;