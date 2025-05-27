import axios from 'axios';
import io from 'socket.io-client';

// ===== CONFIGURAÇÃO DA API =====
const API_CONFIG = {
  // URL base da API
  baseURL: process.env.REACT_APP_API_URL || 'https://edu-ardu-api.onrender.com',
  
  // Timeout das requisições
  timeout: 30000, // 30 segundos
  
  // Headers padrão
  headers: {
    'Content-Type': 'application/json',
  }
};

// Instância do axios configurada
const api = axios.create(API_CONFIG);

// ===== LOGGING SYSTEM =====
const log = {
  info: (message, data) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`🚀 [${timestamp}] ${message}`, data || '');
  },
  success: (message, data) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`✅ [${timestamp}] ${message}`, data || '');
  },
  warn: (message, data) => {
    const timestamp = new Date().toLocaleTimeString();
    console.warn(`⚠️ [${timestamp}] ${message}`, data || '');
  },
  error: (message, data) => {
    const timestamp = new Date().toLocaleTimeString();
    console.error(`❌ [${timestamp}] ${message}`, data || '');
  }
};

// ===== INTERCEPTORS =====
// Request interceptor
api.interceptors.request.use(
  (config) => {
    log.info(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    log.error('Request Error:', error.message);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    const duration = response.config.metadata?.endTime - response.config.metadata?.startTime;
    log.success(`API Response: ${response.config.url} - ${response.status} (${duration}ms)`);
    return response;
  },
  (error) => {
    const status = error.response?.status || 'No Response';
    const url = error.config?.url || 'Unknown URL';
    log.error(`API Error: ${url} - ${status}`, error.message);
    return Promise.reject(error);
  }
);

// Adicionar timestamp para medir duração
api.interceptors.request.use((config) => {
  config.metadata = { startTime: Date.now() };
  return config;
});

api.interceptors.response.use(
  (response) => {
    response.config.metadata.endTime = Date.now();
    return response;
  },
  (error) => {
    if (error.config) {
      error.config.metadata = error.config.metadata || {};
      error.config.metadata.endTime = Date.now();
    }
    return Promise.reject(error);
  }
);

// ===== HEALTH CHECK & WAKE UP =====

/**
 * Verifica se a API está online
 * @returns {Promise<{online: boolean, message: string}>}
 */
export const checkApiHealth = async () => {
  try {
    log.info('🏥 Verificando saúde da API...');
    
    // Tenta usar endpoint de health se existir, senão usa o endpoint de lições
    let response;
    try {
      response = await api.get('/api/health', { timeout: 10000 });
    } catch (healthError) {
      // Se /api/health não existe, testa com /api/lessons
      log.warn('Health endpoint não encontrado, testando com /api/lessons...');
      response = await api.get('/api/lessons', { timeout: 10000 });
    }
    
    if (response && response.status === 200) {
      log.success('✅ API Health Check: SUCESSO');
      return { online: true, message: 'API online' };
    } else {
      throw new Error('Resposta inválida');
    }
  } catch (error) {
    log.warn('⚠️ API Health Check: FALHOU', error.message);
    return { online: false, message: error.message };
  }
};

/**
 * Tenta acordar o servidor (útil para Render free tier)
 * @returns {Promise<boolean>}
 */
export const wakeUpServer = async () => {
  const maxRetries = 3;
  const baseDelay = 2000; // 2 segundos
  
  log.info('☕ Acordando servidor Render... (pode levar 30-60s)');
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      log.info(`🔄 Tentativa ${attempt}/${maxRetries} de wake-up...`);
      
      // Tenta acordar fazendo uma requisição simples
      await api.get('/api/lessons', { 
        timeout: 15000,
        headers: {
          'User-Agent': 'EduArdu-WakeUp/1.0'
        }
      });
      
      // Se chegou aqui, o servidor acordou
      log.success('🎉 Servidor acordou com sucesso!');
      return true;
      
    } catch (error) {
      log.warn(`⚠️ Tentativa ${attempt} falhou:`, error.message);
      
      if (attempt < maxRetries) {
        const delay = baseDelay * attempt;
        log.info(`⏳ Aguardando ${delay/1000}s antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  log.error('❌ Não foi possível acordar o servidor após 3 tentativas');
  return false;
};

// ===== LIÇÕES =====

/**
 * Busca todas as lições disponíveis
 * @returns {Promise<Object>}
 */
export const getAllLessons = async () => {
  try {
    log.info('📚 Buscando todas as lições...');
    
    const response = await api.get('/api/lessons');
    
    if (response.data && Array.isArray(response.data)) {
      log.success(`✅ ${response.data.length} lições carregadas com sucesso`);
      return {
        success: true,
        data: response.data,
        message: 'Lições carregadas com sucesso'
      };
    } else {
      throw new Error('Formato de resposta inválido');
    }
  } catch (error) {
    log.error('❌ Erro ao buscar lições:', error.message);
    return {
      success: false,
      data: [],
      message: error.message
    };
  }
};

/**
 * Busca uma lição específica por ID
 * @param {string} lessonId - ID da lição
 * @returns {Promise<Object>}
 */
export const getLessonById = async (lessonId) => {
  try {
    log.info(`📖 Buscando lição: ${lessonId}`);
    
    const response = await api.get(`/api/lessons/${lessonId}`);
    
    if (response.data) {
      log.success(`✅ Lição "${lessonId}" carregada com sucesso`);
      return {
        success: true,
        data: response.data,
        message: 'Lição carregada com sucesso'
      };
    } else {
      throw new Error('Lição não encontrada');
    }
  } catch (error) {
    log.error(`❌ Erro ao buscar lição "${lessonId}":`, error.message);
    return {
      success: false,
      data: null,
      message: error.message
    };
  }
};

// ===== ROBÔ / ARDUINO =====

/**
 * Busca o status atual do robô/Arduino
 * @returns {Promise<Object>}
 */
export const getRobotStatus = async () => {
  try {
    log.info('🤖 Verificando status do robô...');
    
    const response = await api.get('/api/robot/status');
    
    if (response.data) {
      log.success('✅ Status do robô obtido com sucesso');
      return {
        success: true,
        data: response.data,
        message: 'Status obtido com sucesso'
      };
    } else {
      throw new Error('Resposta inválida do servidor');
    }
  } catch (error) {
    log.warn('⚠️ Erro ao obter status do robô:', error.message);
    return {
      success: false,
      data: {
        connected: false,
        port: null,
        simulationMode: true,
        lastUpdate: new Date().toISOString()
      },
      message: error.message
    };
  }
};

/**
 * Envia comando para o robô
 * @param {string} command - Comando a ser enviado
 * @param {Object} params - Parâmetros do comando
 * @returns {Promise<Object>}
 */
export const sendRobotCommand = async (command, params = {}) => {
  try {
    log.info(`🚀 Enviando comando para robô: ${command}`);
    
    const response = await api.post('/api/robot/command', {
      command,
      params,
      timestamp: new Date().toISOString()
    });
    
    if (response.data) {
      log.success(`✅ Comando "${command}" enviado com sucesso`);
      return {
        success: true,
        data: response.data,
        message: 'Comando enviado com sucesso'
      };
    } else {
      throw new Error('Resposta inválida do servidor');
    }
  } catch (error) {
    log.error(`❌ Erro ao enviar comando "${command}":`, error.message);
    return {
      success: false,
      data: null,
      message: error.message
    };
  }
};

/**
 * Lista portas seriais disponíveis
 * @returns {Promise<Object>}
 */
export const getAvailablePorts = async () => {
  try {
    log.info('🔌 Buscando portas seriais disponíveis...');
    
    const response = await api.get('/api/robot/ports');
    
    if (response.data && Array.isArray(response.data)) {
      log.success(`✅ ${response.data.length} portas encontradas`);
      return {
        success: true,
        data: response.data,
        message: 'Portas carregadas com sucesso'
      };
    } else {
      throw new Error('Formato de resposta inválido');
    }
  } catch (error) {
    log.error('❌ Erro ao buscar portas:', error.message);
    return {
      success: false,
      data: [],
      message: error.message
    };
  }
};

/**
 * Conecta a uma porta serial específica
 * @param {string} port - Nome da porta (ex: COM3, /dev/ttyUSB0)
 * @returns {Promise<Object>}
 */
export const connectToPort = async (port) => {
  try {
    log.info(`🔗 Conectando à porta: ${port}`);
    
    const response = await api.post('/api/robot/connect', { port });
    
    if (response.data) {
      log.success(`✅ Conectado à porta "${port}" com sucesso`);
      return {
        success: true,
        data: response.data,
        message: 'Conectado com sucesso'
      };
    } else {
      throw new Error('Resposta inválida do servidor');
    }
  } catch (error) {
    log.error(`❌ Erro ao conectar à porta "${port}":`, error.message);
    return {
      success: false,
      data: null,
      message: error.message
    };
  }
};

/**
 * Desconecta da porta serial atual
 * @returns {Promise<Object>}
 */
export const disconnectFromPort = async () => {
  try {
    log.info('🔌 Desconectando da porta serial...');
    
    const response = await api.post('/api/robot/disconnect');
    
    if (response.data) {
      log.success('✅ Desconectado com sucesso');
      return {
        success: true,
        data: response.data,
        message: 'Desconectado com sucesso'
      };
    } else {
      throw new Error('Resposta inválida do servidor');
    }
  } catch (error) {
    log.error('❌ Erro ao desconectar:', error.message);
    return {
      success: false,
      data: null,
      message: error.message
    };
  }
};

// ===== CHAT / IA =====

/**
 * Envia mensagem para o chat com IA
 * @param {string} message - Mensagem do usuário
 * @param {string} sessionId - ID da sessão (opcional)
 * @returns {Promise<Object>}
 */
export const sendChatMessage = async (message, sessionId = null) => {
  try {
    log.info('💬 Enviando mensagem para chat IA...');
    
    const response = await api.post('/api/chat', {
      message,
      sessionId,
      timestamp: new Date().toISOString()
    });
    
    if (response.data) {
      log.success('✅ Resposta do chat recebida');
      return {
        success: true,
        data: response.data,
        message: 'Resposta recebida com sucesso'
      };
    } else {
      throw new Error('Resposta inválida do servidor');
    }
  } catch (error) {
    log.error('❌ Erro no chat IA:', error.message);
    return {
      success: false,
      data: {
        response: 'Desculpe, não consegui processar sua mensagem no momento. Tente novamente mais tarde.',
        isError: true
      },
      message: error.message
    };
  }
};

// ===== WEBSOCKET =====

/**
 * Cria conexão WebSocket com o servidor
 * @returns {Socket}
 */
export const createSocket = () => {
  try {
    log.info('🔌 Criando conexão WebSocket...');
    
    const socket = io(API_CONFIG.baseURL, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    
    socket.on('connect', () => {
      log.success('✅ WebSocket conectado');
    });
    
    socket.on('disconnect', () => {
      log.warn('⚠️ WebSocket desconectado');
    });
    
    socket.on('connect_error', (error) => {
      log.error('❌ Erro de conexão WebSocket:', error.message);
    });
    
    return socket;
  } catch (error) {
    log.error('❌ Erro ao criar WebSocket:', error.message);
    return null;
  }
};

// ===== UTILS =====

/**
 * Testa a conectividade com a API
 * @returns {Promise<boolean>}
 */
export const testConnection = async () => {
  try {
    const health = await checkApiHealth();
    return health && health.online;
  } catch (error) {
    console.warn('Erro no teste de conexão:', error.message);
    return false;
  }
};

/**
 * Obtém informações sobre a API
 * @returns {Object}
 */
export const getApiInfo = () => {
  return {
    baseURL: API_CONFIG.baseURL,
    timeout: API_CONFIG.timeout,
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  };
};

// ===== EXPORTS =====

// Exportações nomeadas (principais)
export {
  // Health & Wake
  checkApiHealth,
  wakeUpServer,
  
  // Lições
  getAllLessons,
  getLessonById,
  
  // Robô/Arduino
  getRobotStatus,
  sendRobotCommand,
  getAvailablePorts,
  connectToPort,
  disconnectFromPort,
  
  // Chat/IA
  sendChatMessage,
  
  // WebSocket
  createSocket,
  
  // Utils
  testConnection,
  getApiInfo
};

// Export default da instância do axios (para casos especiais)
export default api;

// ===== LEGACY COMPATIBILITY =====
// Para manter compatibilidade com código existente

// Alias para funções antigas (se houver)
export const getStatus = getRobotStatus; // Fix para o erro "getStatus is not a function"
export const getHealth = checkApiHealth;
export const wakeUp = wakeUpServer;

// ===== INICIALIZAÇÃO =====
console.log('🔧 API Service configurado para Render:', API_CONFIG.baseURL);