import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Row, Col, Button, Form, Card, Alert, Badge, ListGroup,
  Tab, Nav, Modal // Adicionei Tab, Nav, Modal para a interface de programação
} from 'react-bootstrap';
import { 
  FaRobot, FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight, 
  FaStop, FaPlay, FaCog, FaSync, FaPlug, FaUnlink, FaLightbulb, FaComments,
  FaCode, FaUpload // Adicionei novos ícones para a programação
} from 'react-icons/fa';
import { SocketContext } from '../services/socket';
import { listPorts, enableSimulation, uploadCode } from '../services/api'; // Adicionado uploadCode
import '../styles/RobotControlPage.css';

const RobotControlPage = () => {
  // Contexto
  const { socket, robotStatus } = useContext(SocketContext);
  const navigate = useNavigate();
  
  // Estados
  const [portsList, setPortsList] = useState([]);
  const [selectedPort, setSelectedPort] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusUpdates, setStatusUpdates] = useState([]);
  const [error, setError] = useState(null);
  
  // Estados para programação em blocos
  const [blockCode, setBlockCode] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [codeUploadStatus, setCodeUploadStatus] = useState('');
  const [codeUploadLoading, setCodeUploadLoading] = useState(false);
  
  // Buscar lista de portas disponíveis
  useEffect(() => {
    const fetchPorts = async () => {
      try {
        setLoading(true);
        const response = await listPorts();
        
        if (response.success) {
          setPortsList(response.data);
          
          // Se houver portas disponíveis, selecionar a primeira como padrão
          if (response.data.length > 0) {
            setSelectedPort(response.data[0].path);
          }
        } else {
          setError('Erro ao listar portas seriais');
        }
      } catch (err) {
        console.error('Error listing ports:', err);
        setError('Não foi possível listar as portas seriais disponíveis');
      } finally {
        setLoading(false);
      }
    };

    fetchPorts();
  }, []);

  // Configurar ouvintes de eventos do socket
  useEffect(() => {
    if (!socket) return;

    // Ouvir atualizações de status
    const handleStatusUpdate = (data) => {
      const newStatus = {
        id: Date.now(),
        text: data.status,
        timestamp: new Date()
      };
      
      setStatusUpdates(prev => [...prev, newStatus]);
    };

    // Ouvir erros do Arduino
    const handleArduinoError = (data) => {
      setError(`Erro do Arduino: ${data.message}`);
    };

    // Registrar ouvintes
    socket.on('robot:status-update', handleStatusUpdate);
    socket.on('robot:arduino-error', handleArduinoError);
    
    // Limpar ouvintes ao desmontar
    return () => {
      socket.off('robot:status-update', handleStatusUpdate);
      socket.off('robot:arduino-error', handleArduinoError);
    };
  }, [socket]);

  // Função para conectar ao robô
  const handleConnect = () => {
    if (!socket) return;
    
    if (selectedPort) {
      socket.emit('robot:connect', { port: selectedPort });
    } else {
      setError('Selecione uma porta para conectar');
    }
  };

  // Função para desconectar do robô
  const handleDisconnect = () => {
    if (!socket) return;
    
    socket.emit('robot:disconnect');
  };

  // Função para enviar comando ao robô
  const handleSendCommand = (command) => {
    if (!socket) return;
    
    socket.emit('robot:command', { command });
  };

  // Função para ativar modo de simulação
  const handleEnableSimulation = async () => {
    try {
      setLoading(true);
      const response = await enableSimulation();
      
      if (!response.success) {
        setError('Erro ao ativar modo de simulação');
      }
    } catch (err) {
      console.error('Error enabling simulation:', err);
      setError('Não foi possível ativar o modo de simulação');
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar lista de portas
  const handleRefreshPorts = async () => {
    try {
      setLoading(true);
      const response = await listPorts();
      
      if (response.success) {
        setPortsList(response.data);
        
        // Se houver portas disponíveis, selecionar a primeira como padrão
        if (response.data.length > 0) {
          setSelectedPort(response.data[0].path);
        }
      } else {
        setError('Erro ao atualizar lista de portas seriais');
      }
    } catch (err) {
      console.error('Error refreshing ports:', err);
      setError('Não foi possível atualizar a lista de portas seriais');
    } finally {
      setLoading(false);
    }
  };

  // Função para navegar para a página de chat
  const goToChatPage = () => {
    navigate('/robot-chat');
  };
  
  // Função para navegar para a página de programação em blocos
  const goToBlockProgrammingPage = () => {
    navigate('/block-programming');
  };

  // Função para carregar o código do Arduino
  const handleUploadCode = async () => {
    if (!blockCode.trim()) {
      setError('Nenhum código para carregar');
      return;
    }

    try {
      setCodeUploadLoading(true);
      setCodeUploadStatus('Enviando código para o Arduino...');
      
      const response = await uploadCode(blockCode);
      
      if (response.success) {
        setCodeUploadStatus('Código carregado com sucesso!');
        setTimeout(() => setShowUploadModal(false), 2000);
      } else {
        setCodeUploadStatus('Erro ao carregar o código');
        setError('Falha ao carregar o código no Arduino');
      }
    } catch (err) {
      console.error('Error uploading code:', err);
      setCodeUploadStatus('Erro ao carregar o código');
      setError('Não foi possível carregar o código no Arduino');
    } finally {
      setCodeUploadLoading(false);
    }
  };

  //Função para receber o código gerado pelos blocos
    const handleBlockCodeGenerated = (code) => {
    setBlockCode(code);
    setShowUploadModal(true);
  };

  return (
    <Container className="robot-control-page py-4">
      <h1 className="mb-4">
        <FaRobot className="me-2" /> Controle do Robô Edu-Ardu
      </h1>
      
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      
      <Row>
        <Col lg={6} className="mb-3">
          <Button 
            variant="info" 
            size="lg" 
            className="w-100"
            onClick={goToChatPage}
          >
            <FaComments className="me-2" /> Ir para Chat com o Robô
          </Button>
        </Col>
        <Col lg={6} className="mb-3">
          <Button 
            variant="success" 
            size="lg" 
            className="w-100"
            onClick={goToBlockProgrammingPage}
          >
            <FaCode className="me-2" /> Programação em Blocos
          </Button>
        </Col>
      </Row>
      
      <Tab.Container id="control-tabs" defaultActiveKey="connection">
        <Row>
          <Col lg={12} className="mb-3">
            <Nav variant="tabs">
              <Nav.Item>
                <Nav.Link eventKey="connection">Conexão</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="control">Controle</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="programming">Programação</Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
        </Row>
        
        <Tab.Content>
          <Tab.Pane eventKey="connection">
            <Row>
              {/* Painel de Conexão */}
              <Col lg={12}>
                <Card className="mb-4">
                  <Card.Header className="bg-primary text-white">
                    <FaPlug className="me-2" /> Conexão
                  </Card.Header>
                  <Card.Body>
                    <div className="status-indicator mb-3">
                      <div className={`status-dot ${robotStatus.connected ? 'status-connected' : robotStatus.simulationMode ? 'status-simulation' : 'status-disconnected'}`}></div>
                      <span className="status-text">
                        <strong>Status:</strong> {robotStatus.connected ? 'Conectado' : robotStatus.simulationMode ? 'Modo de Simulação' : 'Desconectado'}
                      </span>
                      {robotStatus.port && !robotStatus.simulationMode && (
                        <Badge bg="info" className="ms-2">
                          {robotStatus.port}
                        </Badge>
                      )}
                    </div>
                    
                    {!robotStatus.connected && !robotStatus.simulationMode ? (
                      <>
                        <Form.Group className="mb-3">
                          <Form.Label>Porta Serial:</Form.Label>
                          <div className="d-flex">
                            <Form.Select
                              value={selectedPort}
                              onChange={(e) => setSelectedPort(e.target.value)}
                              disabled={loading || portsList.length === 0}
                              className="me-2"
                            >
                              {portsList.length === 0 ? (
                                <option value="">Nenhuma porta disponível</option>
                              ) : (
                                <>
                                  <option value="">Selecione uma porta...</option>
                                  {portsList.map((port) => (
                                    <option key={port.path} value={port.path}>
                                      {port.path} {port.manufacturer ? `(${port.manufacturer})` : ''}
                                    </option>
                                  ))}
                                </>
                              )}
                            </Form.Select>
                            <Button
                              variant="outline-secondary"
                              onClick={handleRefreshPorts}
                              disabled={loading}
                            >
                              <FaSync className={loading ? 'spin' : ''} />
                            </Button>
                          </div>
                        </Form.Group>
                        
                        <div className="d-flex">
                          <Button
                            variant="success"
                            className="me-2"
                            onClick={handleConnect}
                            disabled={!selectedPort || loading}
                          >
                            <FaPlug className="me-1" /> Conectar
                          </Button>
                          <Button
                            variant="info"
                            onClick={handleEnableSimulation}
                            disabled={loading}
                          >
                            <FaCog className="me-1" /> Modo de Simulação
                          </Button>
                        </div>
                      </>
                    ) : (
                      <Button
                        variant="danger"
                        onClick={handleDisconnect}
                        disabled={loading}
                      >
                        <FaUnlink className="me-1" /> Desconectar
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab.Pane>
          
          <Tab.Pane eventKey="control">
            <Row>
              {/* Painel de Controle */}
              <Col lg={12}>
                <Card className="mb-4">
                  <Card.Header className="bg-primary text-white">
                    <FaCog className="me-2" /> Controles
                  </Card.Header>
                  <Card.Body>
                    {/* Controles de Movimento */}
                    <h5 className="mb-3">Movimento</h5>
                    <div className="movement-controls">
                      <div className="control-row">
                        <div className="spacer"></div>
                        <Button
                          variant="primary"
                          className="direction-btn"
                          onClick={() => handleSendCommand('FORWARD')}
                          disabled={!robotStatus.connected && !robotStatus.simulationMode}
                        >
                          <FaArrowUp />
                        </Button>
                        <div className="spacer"></div>
                      </div>
                      <div className="control-row">
                        <Button
                          variant="primary"
                          className="direction-btn"
                          onClick={() => handleSendCommand('LEFT')}
                          disabled={!robotStatus.connected && !robotStatus.simulationMode}
                        >
                          <FaArrowLeft />
                        </Button>
                        <Button
                          variant="danger"
                          className="direction-btn"
                          onClick={() => handleSendCommand('STOP')}
                          disabled={!robotStatus.connected && !robotStatus.simulationMode}
                        >
                          <FaStop />
                        </Button>
                        <Button
                          variant="primary"
                          className="direction-btn"
                          onClick={() => handleSendCommand('RIGHT')}
                          disabled={!robotStatus.connected && !robotStatus.simulationMode}
                        >
                          <FaArrowRight />
                        </Button>
                      </div>
                      <div className="control-row">
                        <div className="spacer"></div>
                        <Button
                          variant="primary"
                          className="direction-btn"
                          onClick={() => handleSendCommand('BACKWARD')}
                          disabled={!robotStatus.connected && !robotStatus.simulationMode}
                        >
                          <FaArrowDown />
                        </Button>
                        <div className="spacer"></div>
                      </div>
                    </div>

                    {/* Outros Controles */}
                    <h5 className="mb-3 mt-4">Ações</h5>
                    <div className="d-grid gap-2">
                      <Button
                        variant="success"
                        onClick={() => handleSendCommand('DEMO')}
                        disabled={!robotStatus.connected && !robotStatus.simulationMode}
                      >
                        <FaPlay className="me-1" /> Executar Demonstração
                      </Button>
                      <Button
                        variant="warning"
                        onClick={() => handleSendCommand('LED_ON')}
                        disabled={!robotStatus.connected && !robotStatus.simulationMode}
                      >
                        <FaLightbulb className="me-1" /> Acender LED
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleSendCommand('LED_OFF')}
                        disabled={!robotStatus.connected && !robotStatus.simulationMode}
                      >
                        <FaLightbulb className="me-1" /> Apagar LED
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab.Pane>
          
          <Tab.Pane eventKey="programming">
            <Row>
              {/* Painel de Programação */}
              <Col lg={12}>
                <Card className="mb-4">
                  <Card.Header className="bg-primary text-white">
                    <FaCode className="me-2" /> Programação em Blocos
                  </Card.Header>
                  <Card.Body>
                    <div className="text-center mb-4">
                      <p>Utilize a interface de programação em blocos para criar e carregar código personalizado para o seu robô Edu-Ardu.</p>
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={goToBlockProgrammingPage}
                      >
                        <FaCode className="me-2" /> Abrir Editor de Blocos
                      </Button>
                    </div>
                    
                    <div className="mt-4">
                      <h5>Código Atual</h5>
                      <div className="code-preview p-3 bg-light rounded">
                        {blockCode ? (
                          <pre className="mb-0">{blockCode}</pre>
                        ) : (
                          <p className="text-muted mb-0">Nenhum código gerado ainda.</p>
                        )}
                      </div>
                      
                      <div className="d-grid mt-3">
                        <Button
                          variant="success"
                          onClick={() => setShowUploadModal(true)}
                          disabled={!blockCode || (!robotStatus.connected && !robotStatus.simulationMode)}
                        >
                          <FaUpload className="me-2" /> Carregar Código no Arduino
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>

      {/* Log de Status */}
      <Row>
        <Col lg={12}>
          <Card>
            <Card.Header className="bg-primary text-white">
              <FaCog className="me-2" /> Log de Status
            </Card.Header>
            <ListGroup variant="flush" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {statusUpdates.length === 0 ? (
                <ListGroup.Item className="text-muted">
                  Nenhuma atualização de status. Conecte-se ao robô para ver atualizações.
                </ListGroup.Item>
              ) : (
                statusUpdates.map((status) => (
                  <ListGroup.Item key={status.id}>
                    <small className="text-muted">
                      {status.timestamp.toLocaleTimeString()}
                    </small>
                    <span className="ms-2">{status.text}</span>
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
      
      {/* Modal de Upload de Código */}
      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Carregar Código no Arduino</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Deseja carregar o seguinte código no Arduino?</p>
          <pre className="bg-light p-3 rounded">{blockCode}</pre>
          
          {codeUploadStatus && (
            <Alert variant={codeUploadStatus.includes('sucesso') ? 'success' : 'info'}>
              {codeUploadStatus}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUploadCode}
            disabled={codeUploadLoading}
          >
            {codeUploadLoading ? 'Carregando...' : 'Carregar'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default RobotControlPage;