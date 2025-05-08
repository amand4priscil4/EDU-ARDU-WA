import axios from 'axios';

// Configuração base do axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para tratamento global de erros
api.interceptors.response.use(
  response => response.data,
  error => {
    // Logar o erro
    console.error('API Error:', error);

    // Retornar um objeto de erro padronizado
    return Promise.reject({
      message: error.response?.data?.error || 'Erro na comunicação com o servidor',
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

// Serviços de API relacionados ao robô
export const getStatus = () => api.get('/robot/status');
export const sendCommand = command => api.post('/robot/command', { command });
export const sendMessage = message => api.post('/robot/message', { message });
export const connectToPort = port => api.post('/robot/connect', { port });
export const disconnectRobot = () => api.post('/robot/disconnect');
export const listPorts = () => api.get('/robot/ports');
export const enableSimulation = () => api.post('/robot/simulation');
export const uploadCode = code => api.post('/robot/upload-code', { code });

// Serviços de API relacionados às aulas
export const getAllLessons = () => api.get('/lessons');
export const getLessonById = id => api.get(`/lessons/${id}`);
export const checkAnswer = (lessonId, stepId, answer) =>
  api.post('/lessons/check-answer', { lessonId, stepId, answer });

export default api;