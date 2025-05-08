import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
  Spinner,
  ProgressBar
} from 'react-bootstrap';
import {
  FaArrowLeft,
  FaArrowRight,
  FaRobot,
  FaComments,
  FaLightbulb,
  FaCheck,
  FaTimes,
  FaHome
} from 'react-icons/fa';
import { getLessonById, checkAnswer } from '../services/api';
import { SocketContext, sendSocketCommand } from '../services/socket';
import '../styles/LessonPage.css';

const LessonPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket, robotStatus } = useContext(SocketContext);

  // Estados
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [optionSelected, setOptionSelected] = useState(null);

  // Buscar dados da aula
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        const response = await getLessonById(id);

        if (response.success) {
          setLesson(response.data);
        } else {
          setError('Erro ao carregar a aula');
        }
      } catch (err) {
        console.error('Error fetching lesson:', err);
        setError('Não foi possível carregar a aula. Por favor, tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [id]);

  // Função para ir para o próximo passo
  const goToNextStep = () => {
    // Limpar feedback e resposta do usuário
    setFeedback(null);
    setUserAnswer('');
    setOptionSelected(null);

    // Verificar se há um próximo passo
    if (lesson && currentStepIndex < lesson.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);

      // Rolar para o topo
      window.scrollTo(0, 0);
    }
  };

  // Função para voltar ao passo anterior
  const goToPreviousStep = () => {
    // Limpar feedback e resposta do usuário
    setFeedback(null);
    setUserAnswer('');
    setOptionSelected(null);

    // Verificar se há um passo anterior
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);

      // Rolar para o topo
      window.scrollTo(0, 0);
    }
  };

  // Função para enviar resposta
  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) return;

    try {
      const currentStep = lesson.steps[currentStepIndex];

      const response = await checkAnswer(lesson.id, currentStep.id, userAnswer);

      if (response.success) {
        const { isCorrect, feedback: feedbackText } = response.data;

        setFeedback({
          isCorrect,
          text: feedbackText
        });

        // Se a resposta estiver correta, avançar para o próximo passo após um tempo
        if (isCorrect) {
          setTimeout(() => {
            goToNextStep();
          }, 2000);
        }
      } else {
        setError('Erro ao verificar resposta');
      }
    } catch (err) {
      console.error('Error checking answer:', err);
      setError('Não foi possível verificar sua resposta');
    }
  };

  // Função para selecionar uma opção
  const handleSelectOption = option => {
    setOptionSelected(option);

    if (option.response) {
      setFeedback({
        text: option.response,
        isCorrect: option.isCorrect
      });
    }

    // Se a opção tiver um valor correto/incorreto definido
    if (option.isCorrect === true) {
      // Avançar para o próximo passo após um tempo
      setTimeout(() => {
        goToNextStep();
      }, 2000);
    } else if (option.isCorrect === false) {
      // Manter no mesmo passo para tentar novamente
      setTimeout(() => {
        setFeedback(null);
        setOptionSelected(null);
      }, 2000);
    } else {
      // Se não tiver valor, avançar para o próximo passo
      setTimeout(() => {
        goToNextStep();
      }, 1500);
    }
  };

  // Função para enviar comando ao robô
  const handleSendRobotCommand = command => {
    if (!socket) {
      setError('Socket não disponível');
      return;
    }

    if (!robotStatus.connected && !robotStatus.simulationMode) {
      setError('Robô não conectado. Conecte-se ao robô na tela de controle.');
      return;
    }

    sendSocketCommand(socket, command);

    // Avançar para o próximo passo após um tempo
    setTimeout(() => {
      goToNextStep();
    }, 2000);
  };

  // Função para navegar para a home
  const handleGoHome = () => {
    navigate('/');
  };

  // Função para navegar para o controle do robô
  const handleGoToRobotControl = () => {
    navigate('/robot');
  };

  // Renderizar o passo atual
  const renderCurrentStep = () => {
    if (!lesson || loading) return null;

    const currentStep = lesson.steps[currentStepIndex];

    if (!currentStep) return null;

    return (
      <div className="lesson-step">
        {/* Mensagem */}
        <div className="step-message">
          <div className="message-avatar">
            <FaRobot />
          </div>
          <div className="message-content">
            <div className="message-text">{currentStep.message}</div>

            {/* Imagem (se houver) */}
            {currentStep.image && (
              <div className="message-image">
                <img
                  src={currentStep.image}
                  alt="Ilustração da aula"
                  onError={e => {
                    e.target.onerror = null;
                    e.target.src = '/images/imagem5.jpg';
                    e.target.style.opacity = 0.7;
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Resposta */}
        <div className="step-response">
          {/* Opções de resposta */}
          {currentStep.options && (
            <div className="response-options">
              {currentStep.options.map((option, index) => (
                <Button
                  key={index}
                  variant={
                    optionSelected === option
                      ? option.isCorrect === false
                        ? 'danger'
                        : option.isCorrect === true
                        ? 'success'
                        : 'primary'
                      : 'outline-primary'
                  }
                  className="option-button"
                  onClick={() => handleSelectOption(option)}
                  disabled={optionSelected !== null}
                >
                  {option.text}
                </Button>
              ))}
            </div>
          )}

          {/* Campo de resposta para perguntas abertas */}
          {currentStep.waitForAnswer && (
            <div className="response-input">
              <Form.Group>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Digite sua resposta aqui..."
                  value={userAnswer}
                  onChange={e => setUserAnswer(e.target.value)}
                  disabled={feedback !== null}
                />
              </Form.Group>
              <Button
                variant="primary"
                onClick={handleSubmitAnswer}
                disabled={!userAnswer.trim() || feedback !== null}
                className="mt-2"
              >
                Enviar Resposta
              </Button>
            </div>
          )}

          {/* Comandos para o robô */}
          {currentStep.robotCommand && (
            <div className="robot-command">
              <Button
                variant="success"
                onClick={() => handleSendRobotCommand(currentStep.robotCommand)}
                disabled={!robotStatus.connected && !robotStatus.simulationMode}
                className="command-button"
              >
                <FaRobot className="me-2" />
                Executar Comando no Robô
              </Button>

              {!robotStatus.connected && !robotStatus.simulationMode && (
                <Alert variant="warning" className="mt-2">
                  <FaLightbulb className="me-2" />O robô não está conectado.
                  <Button variant="link" className="p-0 ms-2" onClick={handleGoToRobotControl}>
                    Ir para tela de controle
                  </Button>
                </Alert>
              )}
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <Alert
              variant={
                feedback.isCorrect === true
                  ? 'success'
                  : feedback.isCorrect === false
                  ? 'danger'
                  : 'info'
              }
              className="mt-3 feedback-alert"
            >
              {feedback.isCorrect === true && <FaCheck className="me-2" />}
              {feedback.isCorrect === false && <FaTimes className="me-2" />}
              {feedback.text}
            </Alert>
          )}
        </div>
      </div>
    );
  };

  // Calcular o progresso da aula
  const calculateProgress = () => {
    if (!lesson) return 0;

    return Math.round((currentStepIndex / (lesson.steps.length - 1)) * 100);
  };

  // Renderização condicional
  if (loading) {
    return (
      <Container
        className="lesson-page py-4 d-flex justify-content-center align-items-center"
        style={{ minHeight: '60vh' }}
      >
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Carregando aula...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="lesson-page py-4">
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" onClick={handleGoHome}>
          <FaHome className="me-2" /> Voltar para a Página Inicial
        </Button>
      </Container>
    );
  }

  if (!lesson) {
    return (
      <Container className="lesson-page py-4">
        <Alert variant="warning">Aula não encontrada</Alert>
        <Button variant="primary" onClick={handleGoHome}>
          <FaHome className="me-2" /> Voltar para a Página Inicial
        </Button>
      </Container>
    );
  }

  return (
    <Container className="lesson-page py-4">
      {/* Cabeçalho da Aula */}
      <div className="lesson-header">
        <h1>{lesson.title}</h1>
        <p className="lesson-description">{lesson.description}</p>

        {/* Informações da aula */}
        <div className="lesson-info">
          <span className="lesson-level">Nível: {lesson.level || 'Iniciante'}</span>

          {lesson.duration && (
            <span className="lesson-duration">Duração estimada: {lesson.duration} minutos</span>
          )}
        </div>
      </div>

      {/* Progresso da aula */}
      <div className="lesson-progress mb-4">
        <ProgressBar
          now={calculateProgress()}
          label={`${calculateProgress()}%`}
          variant="success"
        />
        <div className="progress-text">
          Passo {currentStepIndex + 1} de {lesson.steps.length}
        </div>
      </div>

      {/* Conteúdo da Aula */}
      <Card className="lesson-content">
        <Card.Body>{renderCurrentStep()}</Card.Body>
      </Card>

      {/* Botões de Navegação */}
      <div className="lesson-navigation mt-4">
        <Button
          variant="outline-primary"
          onClick={goToPreviousStep}
          disabled={currentStepIndex === 0}
        >
          <FaArrowLeft className="me-2" /> Anterior
        </Button>

        <div className="navigation-center">
          <Button variant="outline-secondary" onClick={handleGoHome}>
            <FaHome className="me-2" /> Página Inicial
          </Button>

          <Button variant="outline-info" onClick={handleGoToRobotControl}>
            <FaRobot className="me-2" /> Controle do Robô
          </Button>
        </div>

        <Button
          variant="primary"
          onClick={goToNextStep}
          disabled={currentStepIndex === lesson.steps.length - 1}
        >
          Próximo <FaArrowRight className="ms-2" />
        </Button>
      </div>

      {/* Se for o último passo, mostrar mensagem de conclusão */}
      {currentStepIndex === lesson.steps.length - 1 && (
        <Alert variant="success" className="mt-4">
          <h4>Parabéns!</h4>
          <p>Você concluiu a aula "{lesson.title}".</p>
          <hr />
          <div className="d-flex justify-content-between">
            <Button variant="outline-primary" onClick={handleGoHome}>
              <FaHome className="me-2" /> Voltar para a Página Inicial
            </Button>

            <Button variant="outline-success" onClick={handleGoToRobotControl}>
              <FaRobot className="me-2" /> Ir para o Controle do Robô
            </Button>
          </div>
        </Alert>
      )}
    </Container>
  );
};

export default LessonPage;
