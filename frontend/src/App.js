import React, { useState, useEffect, useCallback } from 'react';
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

// API - Usando a função corrigida
import { getRobotStatus, testConnection } from './services/api';

function App() {
  const [socket, setSocket] = useState(null);
  const [robotStatus, setRobotStatus] = useState({
    connected: false,
    simulationMode: false,
    port: null,
    lastUpdate: null,
    error: null
  });
  const [appStatus, setAppStatus] = useState({
    loading: true,
    apiConnected: false,
    socketConnected: false
  });

  // ===== INICIALIZAÇÃO DO SOCKET =====
  const initializeSocket = useCallback(() => {
    try {
      console.log('🔌 Inicializando conexão Socket.IO...');
      
      // Conexão com o backend
      const socketInstance = io(process.env.REACT_APP_API_URL || 'https://edu-ardu-api.onrender.com', {
        transports: ['websocket', 'polling'], // Fallback para polling se websocket falhar
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000
      });

      // Eventos do socket
      socketInstance.on('connect', () => {
        console.log('✅ Conectado ao servidor socket:', socketInstance.id);
        setAppStatus(prev => ({ ...prev, socketConnected: true }));
      });

      socketInstance.on('disconnect', (reason) => {
        console.log('⚠️ Desconectado do servidor socket:', reason);
        setAppStatus(prev => ({ ...prev, socketConnected: false }));
      });

      socketInstance.on('connect_error', (error) => {
        console.warn('⚠️ Erro de conexão socket:', error.message);
        setAppStatus(prev => ({ ...prev, socketConnected: false }));
      });

      // Eventos específicos do robô
      socketInstance.on('robot:status', status => {
        console.log('🤖 Status do robô atualizado:', status);
        setRobotStatus(prev => ({
          ...prev,
          ...status,
          lastUpdate: new Date().toISOString(),
          error: null
        }));
      });

      socketInstance.on('robot:connected', (data) => {
        console.log('✅ Robô conectado:', data);
        setRobotStatus(prev => ({
          ...prev,
          connected: true,
          port: data.port,
          simulationMode: false,
          lastUpdate: new Date().toISOString(),
          error: null
        }));
      });

      socketInstance.on('robot:disconnected', (data) => {
        console.log('⚠️ Robô desconectado:', data);
        setRobotStatus(prev => ({
          ...prev,
          connected: false,
          port: null,
          simulationMode: true,
          lastUpdate: new Date().toISOString(),
          error: data?.reason || 'Desconectado'
        }));
      });

      socketInstance.on('error', error => {
        console.error('❌ Erro do socket:', error);
        setRobotStatus(prev => ({
          ...prev,
          error: error.message || 'Erro de comunicação',
          lastUpdate: new Date().toISOString()
        }));
      });

      setSocket(socketInstance);
      return socketInstance;
    } catch (error) {
      console.error('❌ Erro ao inicializar socket:', error);
      setAppStatus(prev => ({ ...prev, socketConnected: false }));
      return null;
    }
  }, []);

  // ===== BUSCAR STATUS DO ROBÔ =====
  const fetchRobotStatus = useCallback(async () => {
    try {
      console.log('🤖 Buscando status do robô...');
      
      // Usar a função corrigida getRobotStatus
      const response = await getRobotStatus();
      
      if (response && response.success && response.data) {
        console.log('✅ Status do robô obtido:', response.data);
        setRobotStatus(prev => ({
          ...prev,
          ...response.data,
          lastUpdate: new Date().toISOString(),
          error: null
        }));
      } else {
        // Modo fallback - simulação
        console.log('⚠️ API não disponível, modo simulação ativado');
        setRobotStatus(prev => ({
          ...prev,
          connected: false,
          port: null,
          simulationMode: true,
          lastUpdate: new Date().toISOString(),
          error: 'API não disponível'
        }));
      }
    } catch (error) {
      console.warn('⚠️ Erro ao buscar status do robô:', error.message);
      
      // Modo fallback - simulação
      setRobotStatus(prev => ({
        ...prev,
        connected: false,
        port: null,
        simulationMode: true,
        lastUpdate: new Date().toISOString(),
        error: error.message
      }));
    }
  }, []);

  // ===== TESTAR CONECTIVIDADE DA API =====
  const checkApiConnection = useCallback(async () => {
    try {
      console.log('🔍 Testando conectividade com a API...');
      const isConnected = await testConnection();
      
      setAppStatus(prev => ({ ...prev, apiConnected: isConnected }));
      
      if (isConnected) {
        console.log('✅ API está acessível');
      } else {
        console.log('⚠️ API não está acessível, modo offline ativado');
      }
      
      return isConnected;
    } catch (error) {
      console.error('❌ Erro ao testar conectividade:', error);
      setAppStatus(prev => ({ ...prev, apiConnected: false }));
      return false;
    }
  }, []);

  // ===== INICIALIZAÇÃO DA APLICAÇÃO =====
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Inicializando aplicação Edu-Ardu...');
        setAppStatus(prev => ({ ...prev, loading: true }));

        // 1. Testar conectividade com a API
        const apiAvailable = await checkApiConnection();

        // 2. Buscar status inicial do robô
        await fetchRobotStatus();

        // 3. Inicializar socket
        const socketInstance = initializeSocket();

        // 4. Finalizar inicialização
        setAppStatus(prev => ({ 
          ...prev, 
          loading: false,
          apiConnected: apiAvailable,
          socketConnected: !!socketInstance
        }));

        console.log('✅ Aplicação inicializada com sucesso');
      } catch (error) {
        console.error('❌ Erro na inicialização da aplicação:', error);
        setAppStatus(prev => ({ ...prev, loading: false }));
      }
    };

    initializeApp();

    // Limpeza ao desmontar
    return () => {
      if (socket) {
        console.log('🔌 Desconectando socket...');
        socket.disconnect();
      }
    };
  }, []); // Dependências vazias - executa só uma vez

  // ===== ATUALIZAÇÕES PERIÓDICAS =====
  useEffect(() => {
    // Atualizar status do robô a cada 30 segundos se API disponível
    if (appStatus.apiConnected) {
      const interval = setInterval(() => {
        fetchRobotStatus();
      }, 30000); // 30 segundos

      return () => clearInterval(interval);
    }
  }, [appStatus.apiConnected, fetchRobotStatus]);

  // ===== CONTEXTO DO SOCKET =====
  const socketContextValue = {
    socket,
    robotStatus,
    isConnected: appStatus.socketConnected,
    isApiAvailable: appStatus.apiConnected,
    updateRobotStatus: setRobotStatus,
    reconnect: initializeSocket
  };

  // ===== LOADING STATE =====
  if (appStatus.loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0066CC 0%, #003d7a 100%)',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid rgba(255,255,255,0.3)',
          borderTop: '4px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }} />
        <h3>🤖 Inicializando Edu-Ardu...</h3>
        <p style={{ opacity: 0.8 }}>Conectando aos serviços</p>
        
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <SocketContext.Provider value={socketContextValue}>
      <div className="app-container">
        <Header />
        
        {/* Debug Info (apenas em desenvolvimento) */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            background: '#fff3cd',
            border: '1px solid #ffeaa7',
            color: '#856404',
            padding: '8px 20px',
            fontSize: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>
              <strong>Debug:</strong> 
              API: {appStatus.apiConnected ? '✅' : '❌'} | 
              Socket: {appStatus.socketConnected ? '✅' : '❌'} | 
              Robô: {robotStatus.connected ? '✅' : robotStatus.simulationMode ? '🔄' : '❌'}
            </span>
            {robotStatus.error && (
              <span style={{ color: '#dc3545' }}>
                Erro: {robotStatus.error}
              </span>
            )}
          </div>
        )}
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/lessons/:id" element={<LessonPage />} />
            <Route path="/robot" element={<RobotControlPage />} />
            <Route path="/robot-chat" element={<RobotChatPage />} />
            <Route path="/block-programming" element={<BlockProgrammingPage />} />
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