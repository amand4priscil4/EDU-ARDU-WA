import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Row, Col, Button, Form, Card, Alert 
} from 'react-bootstrap';
import { 
  FaRobot, FaCog, FaComment, FaPaperPlane
} from 'react-icons/fa';
import { SocketContext } from '../services/socket';
import '../styles/RobotChatPage.css';

const RobotChatPage = () => {
  // Contexto
  const { socket, robotStatus } = useContext(SocketContext);
  const navigate = useNavigate();
  
  // Estados
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [error, setError] = useState(null);
  
  // Refs
  const chatContainerRef = useRef(null);
  
  // Configurar ouvintes de eventos do socket
  useEffect(() => {
    if (!socket) return;

    // Ouvir mensagens do chat
    const handleChatMessage = (messageObj) => {
      setChatMessages(prev => [...prev, messageObj]);
    };

    // Registrar ouvinte
    socket.on('chat:message', handleChatMessage);
    
    // Limpar ouvinte ao desmontar
    return () => {
      socket.off('chat:message', handleChatMessage);
    };
  }, [socket]);

  // Rolar o chat para o final quando novas mensagens chegarem
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Função para enviar mensagem ao robô
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!socket || !message.trim()) return;
    
    // Validar se o robô está conectado
    if (!robotStatus.connected && !robotStatus.simulationMode) {
      setError('Robô não conectado. Conecte-se ao robô na tela de controle.');
      return;
    }
    
    // Enviar mensagem para o servidor
    socket.emit('robot:message', { message: message.trim() });
    
    // Limpar campo de entrada
    setMessage('');
  };

  // Função para navegar para a página de controle
  const goToControlPage = () => {
    navigate('/robot');
  };

  return (
    <Container className="robot-chat-page py-4">
      <h1 className="mb-4">
        <FaComment className="me-2" /> Conversa com o Robô Edu-Ardu
      </h1>
      
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      
      <Row>
        <Col lg={12} className="mb-3">
          <Button 
            variant="primary" 
            size="lg" 
            className="w-100"
            onClick={goToControlPage}
          >
            <FaCog className="me-2" /> Ir para Controle do Robô
          </Button>
        </Col>
      </Row>
      
      <Row>
        <Col lg={12}>
          <Card className="chat-card">
            <Card.Header className="bg-primary text-white">
              <FaRobot className="me-2" /> Conversa com o Robô
              <div className="float-end">
                <span className={`status-indicator ${robotStatus.connected || robotStatus.simulationMode ? 'connected' : 'disconnected'}`}>
                  {robotStatus.connected || robotStatus.simulationMode ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="chat-messages" ref={chatContainerRef}>
                {chatMessages.length === 0 ? (
                  <div className="no-messages">
                    <FaRobot size={48} className="mb-3" />
                    <p>Envie uma mensagem para começar a conversa com o robô!</p>
                    {(!robotStatus.connected && !robotStatus.simulationMode) && (
                      <p className="text-danger">
                        O robô não está conectado. Vá para a página de controle para conectá-lo.
                      </p>
                    )}
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`chat-message ${msg.sender === 'user' ? 'user-message' : 'robot-message'}`}
                    >
                      {msg.sender === 'robot' && (
                        <div className="message-avatar">
                          <FaRobot />
                        </div>
                      )}
                      <div className="message-content">
                        <div className="message-text">{msg.text}</div>
                        <div className="message-time">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <Form onSubmit={handleSendMessage} className="chat-input">
                <Form.Control
                  type="text"
                  placeholder="Digite uma pergunta sobre robótica..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={!robotStatus.connected && !robotStatus.simulationMode}
                />
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={!message.trim() || (!robotStatus.connected && !robotStatus.simulationMode)}
                >
                  <FaPaperPlane />
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RobotChatPage;