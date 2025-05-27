import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLessonById, checkAnswer, sendRobotCommand, checkApiHealth } from '../services/api';

const LessonPage = () => {
  const { id } = useParams(); // Pegar ID da URL
  const navigate = useNavigate(); // Navegação real
  
  // Estados originais mantidos
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [optionSelected, setOptionSelected] = useState(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');
  const [userStats, setUserStats] = useState({
    totalXP: 450,
    currentLevel: 3,
    streak: 7,
    gems: 89,
    lives: 5,
    earnedXP: 0
  });

  // Dados fallback para quando a API não está disponível
  const fallbackLessons = {
    'robotica-basica': {
      id: 'robotica-basica',
      title: 'Conceitos Básicos de Robótica',
      description: 'Aprenda os fundamentos da robótica, tipos de robôs e suas aplicações no mundo moderno.',
      level: 'Iniciante',
      duration: 15,
      xpReward: 50,
      steps: [
        {
          id: 'intro',
          message: 'Olá! Bem-vindo à sua primeira aula de robótica! 🤖 Vamos descobrir juntos o fascinante mundo dos robôs. Você está pronto para essa aventura?',
          image: null,
          options: [
            { text: 'Sim, estou pronto!', isCorrect: true, response: 'Ótimo! Vamos começar nossa jornada!' },
            { text: 'Tenho algumas dúvidas...', isCorrect: false, response: 'Não se preocupe, vamos esclarecer tudo!' }
          ]
        },
        {
          id: 'definicao',
          message: 'Um robô é uma máquina programável que pode executar tarefas automaticamente. Eles podem ser simples como um aspirador de pó ou complexos como robôs industriais. O que você acha que define um robô?',
          image: null,
          options: [
            { text: 'Capacidade de se mover', isCorrect: false, response: 'Movimento é importante, mas não é o único fator!' },
            { text: 'Ser programável', isCorrect: true, response: 'Exato! A programabilidade é fundamental!' },
            { text: 'Ter forma humana', isCorrect: false, response: 'Nem todos os robôs precisam parecer humanos!' }
          ]
        },
        {
          id: 'tipos',
          message: 'Existem diferentes tipos de robôs: industriais, domésticos, médicos, espaciais e muitos outros. Qual tipo de robô você gostaria de construir?',
          image: null,
          waitForAnswer: true
        },
        {
          id: 'aplicacoes',
          message: 'Os robôs estão presentes em muitas áreas: fábricas, hospitais, exploração espacial, limpeza doméstica e até entretenimento! Que tal pensarmos em uma aplicação inovadora?',
          image: null,
          robotCommand: 'forward'
        },
        {
          id: 'conclusao',
          message: 'Parabéns! Você completou sua primeira lição sobre robótica! 🎉 Agora você entende os conceitos básicos. Ready para a próxima aventura?',
          image: null,
          options: [
            { text: 'Vamos para a próxima!', isCorrect: true, response: 'Excelente! Continue aprendendo!' }
          ]
        }
      ]
    },
    'introducao-arduino': {
      id: 'introducao-arduino',
      title: 'Introdução ao Arduino',
      description: 'Conheça a plataforma Arduino, componentes e programação básica para criar projetos incríveis.',
      level: 'Iniciante',
      duration: 20,
      xpReward: 75,
      steps: [
        {
          id: 'intro',
          message: 'Olá novamente! Agora que você já conhece os conceitos básicos de robótica, vamos aprender sobre o Arduino! 🤖 Você está pronto?',
          image: null,
          options: [
            { text: 'Sim, estou pronto!', isCorrect: true, response: 'Ótimo! Vamos começar nossa jornada pelo mundo do Arduino!' },
            { text: 'O que é Arduino?', isCorrect: true, response: 'Boa pergunta! Vamos descobrir juntos o que é o Arduino.' }
          ]
        },
        {
          id: 'definicao',
          message: 'Arduino é uma pequena placa de computador que podemos programar para fazer muitas coisas legais, como acender luzes, tocar músicas, mover robôs e muito mais!',
          image: null
        },
        {
          id: 'programacao',
          message: 'Para programar um Arduino, escrevemos códigos que dizem exatamente o que ele deve fazer. É como dar instruções muito precisas para um amigo robótico!',
          image: null,
          waitForAnswer: true
        },
        {
          id: 'led-comando',
          message: 'Vamos testar um comando básico! Vou fazer o LED do Arduino piscar. Clique no botão abaixo:',
          image: null,
          robotCommand: 'LED_ON'
        },
        {
          id: 'conclusao',
          message: 'Excelente! Você aprendeu o básico sobre Arduino. Na próxima aula vamos fazer projetos mais avançados! 🎉',
          image: null,
          options: [
            { text: 'Estou animado!', isCorrect: true, response: 'Que bom! Continue assim!' }
          ]
        }
      ]
    }
  };

  // Buscar dados da lição da API
  useEffect(() => {
    const fetchLesson = async () => {
      if (!id) {
        setError('ID da lição não fornecido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log(`📖 Carregando lição: ${id}`);
        
        // Primeiro verificar se a API está online
        const healthCheck = await checkApiHealth();
        
        if (healthCheck.online) {
          console.log('✅ API online, buscando lição da API...');
          setApiStatus('online');
          setIsOfflineMode(false);
          
          // Buscar lição da API
          const response = await getLessonById(id);
          
          if (response && response.success && response.data) {
            setLesson(response.data);
            console.log(`✅ Lição "${response.data.title}" carregada da API`);
          } else {
            throw new Error('Lição não encontrada na API');
          }
        } else {
          throw new Error('API offline');
        }
        
      } catch (err) {
        console.warn('⚠️ Erro ao carregar da API, usando fallback:', err.message);
        
        // Usar dados fallback
        if (fallbackLessons[id]) {
          setLesson(fallbackLessons[id]);
          setIsOfflineMode(true);
          setApiStatus('offline');
          console.log(`✅ Lição "${fallbackLessons[id].title}" carregada do fallback`);
        } else {
          setError(`Lição "${id}" não encontrada nem na API nem no fallback`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [id]);

  // Ícones SVG (mantidos)
  const RobotIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M12,4A0.5,0.5 0 0,0 11.5,4.5A0.5,0.5 0 0,0 12,5A0.5,0.5 0 0,0 12.5,4.5A0.5,0.5 0 0,0 12,4M6,8.5A1.5,1.5 0 0,1 7.5,10A1.5,1.5 0 0,1 6,11.5A1.5,1.5 0 0,1 4.5,10A1.5,1.5 0 0,1 6,8.5M18,8.5A1.5,1.5 0 0,1 19.5,10A1.5,1.5 0 0,1 18,11.5A1.5,1.5 0 0,1 16.5,10A1.5,1.5 0 0,1 18,8.5Z"/>
    </svg>
  );

  const ArrowLeftIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"/>
    </svg>
  );

  const ArrowRightIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"/>
    </svg>
  );

  const HomeIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z"/>
    </svg>
  );

  const CheckIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
    </svg>
  );

  const TimesIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
    </svg>
  );

  const LightbulbIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12,2A7,7 0 0,0 5,9C5,11.38 6.19,13.47 8,14.74V17A1,1 0 0,0 9,18H15A1,1 0 0,0 16,17V14.74C17.81,13.47 19,11.38 19,9A7,7 0 0,0 12,2M9,21A1,1 0 0,0 10,22H14A1,1 0 0,0 15,21V20H9V21Z"/>
    </svg>
  );

  const StarIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"/>
    </svg>
  );

  const WifiOffIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M1,4.27L2.28,3L21,21.72L19.73,23L12.87,16.14C12.6,16.14 12.32,16.14 12,16.14C11.68,16.14 11.4,16.14 11.13,16.14L1,4.27M8.5,9.34L10.18,11C10.78,10.92 11.39,10.87 12,10.87C15.71,10.87 19.05,12.28 21.64,14.66L23.05,13.25C20.32,10.68 16.87,9.26 13.18,8.76L14.59,10.17L8.5,9.34M12,17.23C11.28,17.23 10.6,17.32 9.96,17.5L12,20.23L14.04,17.5C13.4,17.32 12.72,17.23 12,17.23Z"/>
    </svg>
  );

  // Funções de navegação reais
  const goToNextStep = () => {
    setFeedback(null);
    setUserAnswer('');
    setOptionSelected(null);

    if (lesson && currentStepIndex < lesson.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      window.scrollTo(0, 0);
    }
  };

  const goToPreviousStep = () => {
    setFeedback(null);
    setUserAnswer('');
    setOptionSelected(null);

    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      window.scrollTo(0, 0);
    }
  };

  // Verificar resposta usando API real
  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) return;

    try {
      const currentStep = lesson.steps[currentStepIndex];
      console.log(`🤔 Verificando resposta para ${lesson.id}/${currentStep.id}:`, userAnswer);

      if (!isOfflineMode && apiStatus === 'online') {
        // Usar API real
        const response = await checkAnswer(lesson.id, currentStep.id, userAnswer);
        
        if (response && response.success) {
          const { isCorrect, feedback: feedbackText, xpEarned } = response.data;

          setFeedback({
            isCorrect,
            text: feedbackText
          });

          if (isCorrect && xpEarned) {
            setUserStats(prev => ({ ...prev, earnedXP: prev.earnedXP + xpEarned }));
          }

          if (isCorrect) {
            setTimeout(() => {
              goToNextStep();
            }, 2000);
          }
        } else {
          throw new Error('Resposta inválida da API');
        }
      } else {
        // Fallback offline - simulação simples
        const mockResponse = {
          isCorrect: true,
          feedback: `Excelente resposta! "${userAnswer}" mostra que você está entendendo os conceitos. +10 XP (modo offline)`
        };

        setFeedback({
          isCorrect: mockResponse.isCorrect,
          text: mockResponse.feedback
        });

        if (mockResponse.isCorrect) {
          setUserStats(prev => ({ ...prev, earnedXP: prev.earnedXP + 10 }));
          setTimeout(() => {
            goToNextStep();
          }, 2000);
        }
      }
    } catch (err) {
      console.error('❌ Erro ao verificar resposta:', err);
      setError('Não foi possível verificar sua resposta. Tente novamente.');
    }
  };

  // Selecionar opção (sem necessidade de API)
  const handleSelectOption = option => {
    setOptionSelected(option);

    if (option.response) {
      setFeedback({
        text: option.response + (isOfflineMode ? ' (modo offline)' : ''),
        isCorrect: option.isCorrect
      });
    }

    if (option.isCorrect === true) {
      setUserStats(prev => ({ ...prev, earnedXP: prev.earnedXP + 5 }));
      setTimeout(() => {
        goToNextStep();
      }, 2000);
    } else if (option.isCorrect === false) {
      setTimeout(() => {
        setFeedback(null);
        setOptionSelected(null);
      }, 2000);
    } else {
      setTimeout(() => {
        goToNextStep();
      }, 1500);
    }
  };

  // Enviar comando para robô usando API real
  const handleSendRobotCommand = async (command) => {
    try {
      console.log(`🎮 Enviando comando para robô: ${command}`);

      if (!isOfflineMode && apiStatus === 'online') {
        // Usar API real
        const response = await sendRobotCommand(command);
        
        if (response && response.success) {
          console.log('✅ Comando executado:', response.data.message);
          setUserStats(prev => ({ ...prev, earnedXP: prev.earnedXP + 15 }));
        } else {
          console.warn('⚠️ Comando falhou, usando simulação');
          setUserStats(prev => ({ ...prev, earnedXP: prev.earnedXP + 10 }));
        }
      } else {
        // Modo offline - simulação
        console.log('🔄 Executando comando em modo simulação');
        setUserStats(prev => ({ ...prev, earnedXP: prev.earnedXP + 10 }));
      }

      setTimeout(() => {
        goToNextStep();
      }, 2000);
    } catch (err) {
      console.error('❌ Erro ao enviar comando:', err);
      // Continuar mesmo com erro
      setUserStats(prev => ({ ...prev, earnedXP: prev.earnedXP + 5 }));
      setTimeout(() => {
        goToNextStep();
      }, 2000);
    }
  };

  const calculateProgress = () => {
    if (!lesson) return 0;
    return Math.round(((currentStepIndex + 1) / lesson.steps.length) * 100);
  };

  const renderCurrentStep = () => {
    if (!lesson || loading) return null;

    const currentStep = lesson.steps[currentStepIndex];
    if (!currentStep) return null;

    return (
      <div style={{ padding: '20px' }}>
        {/* Mensagem do Robô */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          marginBottom: '25px',
          gap: '15px'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <RobotIcon size={24} color="white" />
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
            padding: '20px',
            borderRadius: '20px',
            flex: 1,
            border: '2px solid #e9ecef'
          }}>
            <p style={{ margin: 0, lineHeight: '1.6', color: '#333', fontSize: '16px' }}>
              {currentStep.message}
            </p>
            
            {currentStep.image && (
              <div style={{ marginTop: '15px' }}>
                <img
                  src={currentStep.image}
                  alt="Ilustração da aula"
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    borderRadius: '15px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                  }}
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

        {/* Opções de Resposta */}
        {currentStep.options && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              display: 'grid',
              gap: '10px',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'
            }}>
              {currentStep.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectOption(option)}
                  disabled={optionSelected !== null}
                  style={{
                    background: optionSelected === option
                      ? option.isCorrect === false
                        ? 'linear-gradient(135deg, #E91E63, #AD1457)'
                        : option.isCorrect === true
                        ? 'linear-gradient(135deg, #00C851, #007E33)'
                        : 'linear-gradient(135deg, #0066CC, #003d7a)'
                      : 'white',
                    color: optionSelected === option ? 'white' : '#0066CC',
                    border: optionSelected === option ? 'none' : '2px solid #0066CC',
                    padding: '15px 20px',
                    borderRadius: '25px',
                    cursor: optionSelected !== null ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '16px',
                    fontWeight: '500',
                    textAlign: 'center',
                    opacity: optionSelected !== null && optionSelected !== option ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (optionSelected === null) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 5px 15px rgba(0,102,204,0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (optionSelected === null) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                >
                  {option.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Campo de Resposta Aberta */}
        {currentStep.waitForAnswer && (
          <div style={{ marginBottom: '20px' }}>
            <textarea
              placeholder="Digite sua resposta aqui..."
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              disabled={feedback !== null}
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '15px',
                border: '2px solid #e9ecef',
                borderRadius: '15px',
                fontSize: '16px',
                fontFamily: 'inherit',
                resize: 'vertical',
                outline: 'none',
                background: feedback !== null ? '#f8f9fa' : 'white'
              }}
            />
            <button
              onClick={handleSubmitAnswer}
              disabled={!userAnswer.trim() || feedback !== null}
              style={{
                background: (!userAnswer.trim() || feedback !== null) 
                  ? '#cccccc' 
                  : 'linear-gradient(135deg, #0066CC, #003d7a)',
                color: 'white',
                border: 'none',
                padding: '12px 25px',
                borderRadius: '25px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: (!userAnswer.trim() || feedback !== null) ? 'not-allowed' : 'pointer',
                marginTop: '10px',
                transition: 'all 0.2s'
              }}
            >
              Enviar Resposta
            </button>
          </div>
        )}

        {/* Comando do Robô */}
        {currentStep.robotCommand && (
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <button
              onClick={() => handleSendRobotCommand(currentStep.robotCommand)}
              style={{
                background: 'linear-gradient(135deg, #00C851, #007E33)',
                color: 'white',
                border: 'none',
                padding: '15px 30px',
                borderRadius: '25px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                margin: '0 auto',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              <RobotIcon size={20} />
              Executar Comando no Robô
            </button>
            
            <div style={{
              background: isOfflineMode ? '#ffecb3' : '#fff3cd',
              color: '#856404',
              padding: '10px 15px',
              borderRadius: '10px',
              marginTop: '15px',
              border: '1px solid #ffeaa7',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px'
            }}>
              {isOfflineMode ? <WifiOffIcon size={16} /> : <LightbulbIcon size={16} />}
              {isOfflineMode 
                ? 'Modo offline - comando simulado localmente'
                : 'Robô conectado via API - comando será executado'
              }
            </div>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div style={{
            background: feedback.isCorrect === true
              ? '#d4edda'
              : feedback.isCorrect === false
              ? '#f8d7da'
              : '#d1ecf1',
            color: feedback.isCorrect === true
              ? '#155724'
              : feedback.isCorrect === false
              ? '#721c24'
              : '#0c5460',
            padding: '15px 20px',
            borderRadius: '15px',
            border: `2px solid ${feedback.isCorrect === true
              ? '#c3e6cb'
              : feedback.isCorrect === false
              ? '#f5c6cb'
              : '#bee5eb'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginTop: '15px',
            fontSize: '16px'
          }}>
            {feedback.isCorrect === true && <CheckIcon size={20} />}
            {feedback.isCorrect === false && <TimesIcon size={20} />}
            {feedback.text}
          </div>
        )}
      </div>
    );
  };

  // Loading State
  if (loading) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #0066CC 0%, #003d7a 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        padding: '20px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid rgba(255,255,255,0.3)',
            borderTop: '5px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p style={{ fontSize: '18px' }}>Carregando aula...</p>
          {apiStatus === 'checking' && (
            <small style={{ opacity: 0.8 }}>Verificando conexão com API...</small>
          )}
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #0066CC 0%, #003d7a 100%)',
        minHeight: '100vh',
        padding: '20px',
        color: 'white'
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: '40px',
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '20px',
          color: '#333',
          textAlign: 'center'
        }}>
          <div style={{
            background: '#f8d7da',
            color: '#721c24',
            padding: '20px',
            borderRadius: '15px',
            marginBottom: '20px',
            border: '2px solid #f5c6cb'
          }}>
            {error}
          </div>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'linear-gradient(135deg, #0066CC, #003d7a)',
              color: 'white',
              border: 'none',
              padding: '12px 25px',
              borderRadius: '25px',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto'
            }}
          >
            <HomeIcon size={16} /> Voltar para a Página Inicial
          </button>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #0066CC 0%, #003d7a 100%)',
        minHeight: '100vh',
        padding: '20px',
        color: 'white'
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: '40px',
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '20px',
          color: '#333',
          textAlign: 'center'
        }}>
          <div style={{
            background: '#fff3cd',
            color: '#856404',
            padding: '20px',
            borderRadius: '15px',
            marginBottom: '20px',
            border: '2px solid #ffeaa7'
          }}>
            Aula não encontrada
          </div>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'linear-gradient(135deg, #0066CC, #003d7a)',
              color: 'white',
              border: 'none',
              padding: '12px 25px',
              borderRadius: '25px',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto'
            }}
          >
            <HomeIcon size={16} /> Voltar para a Página Inicial
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0066CC 0%, #003d7a 100%)',
      minHeight: '100vh',
      color: 'white',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Banner de Status (se offline) */}
        {isOfflineMode && (
          <div style={{
            background: 'rgba(255, 193, 7, 0.9)',
            color: '#856404',
            padding: '10px 20px',
            borderRadius: '10px',
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px'
          }}>
            <WifiOffIcon size={18} />
            <span>
              <strong>Modo Offline:</strong> API não disponível. Usando dados locais.
            </span>
          </div>
        )}
        
        {/* Header da Aula */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '25px',
          marginBottom: '20px',
          color: '#333'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <div style={{ flex: 1 }}>
              <h1 style={{ color: '#0066CC', margin: '0 0 8px 0', fontSize: '28px' }}>
                {lesson.title}
              </h1>
              <p style={{ color: '#666', margin: '0 0 15px 0', fontSize: '16px', lineHeight: '1.5' }}>
                {lesson.description}
              </p>
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <span style={{
                  background: '#E3F2FD',
                  color: '#0066CC',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '14px'
                }}>
                  Nível: {lesson.level || 'Iniciante'}
                </span>
                {lesson.duration && (
                  <span style={{
                    background: '#FFF3E0',
                    color: '#FF6B35',
                    padding: '5px 12px',
                    borderRadius: '20px',
                    fontSize: '14px'
                  }}>
                    {lesson.duration} minutos
                  </span>
                )}
                <span style={{
                  background: '#E8F5E8',
                  color: '#00C851',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <StarIcon size={14} />
                  +{lesson.xpReward} XP
                </span>
                {isOfflineMode && (
                  <span style={{
                    background: '#FFF3E0',
                    color: '#FF6B35',
                    padding: '5px 12px',
                    borderRadius: '20px',
                    fontSize: '12px'
                  }}>
                    OFFLINE
                  </span>
                )}
              </div>
            </div>
            
            {userStats.earnedXP > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, #FFD700, #FFA000)',
                color: 'white',
                padding: '10px 15px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '16px',
                fontWeight: 'bold'
              }}>
                <StarIcon size={20} />
                +{userStats.earnedXP} XP
              </div>
            )}
          </div>
          
          {/* Progresso da Aula */}
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ color: '#0066CC', fontWeight: '500' }}>
                Passo {currentStepIndex + 1} de {lesson.steps.length}
              </span>
              <span style={{ color: '#666', fontSize: '14px' }}>
                {calculateProgress()}% concluído
              </span>
            </div>
            <div style={{
              height: '10px',
              background: '#e9ecef',
              borderRadius: '5px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${calculateProgress()}%`,
                height: '100%',
                background: 'linear-gradient(to right, #00C851, #007E33)',
                borderRadius: '5px',
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>
        </div>

        {/* Conteúdo da Aula */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          marginBottom: '20px',
          overflow: 'hidden'
        }}>
          {renderCurrentStep()}
        </div>

        {/* Navegação */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '15px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={goToPreviousStep}
            disabled={currentStepIndex === 0}
            style={{
              background: currentStepIndex === 0 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.9)',
              color: currentStepIndex === 0 ? 'rgba(255,255,255,0.6)' : '#0066CC',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '25px',
              fontSize: '16px',
              cursor: currentStepIndex === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <ArrowLeftIcon size={16} /> Anterior
          </button>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                background: 'rgba(255,255,255,0.9)',
                color: '#666',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '25px',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <HomeIcon size={16} /> Início
            </button>

            <button
              onClick={() => navigate('/robot')}
              style={{
                background: 'rgba(255,255,255,0.9)',
                color: '#E91E63',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '25px',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <RobotIcon size={16} /> Robô
            </button>
          </div>

          <button
            onClick={goToNextStep}
            disabled={currentStepIndex === lesson.steps.length - 1}
            style={{
              background: currentStepIndex === lesson.steps.length - 1 
                ? 'rgba(255,255,255,0.3)' 
                : 'rgba(255,255,255,0.9)',
              color: currentStepIndex === lesson.steps.length - 1 
                ? 'rgba(255,255,255,0.6)' 
                : '#0066CC',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '25px',
              fontSize: '16px',
              cursor: currentStepIndex === lesson.steps.length - 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            Próximo <ArrowRightIcon size={16} />
          </button>
        </div>

        {/* Mensagem de Conclusão */}
        {currentStepIndex === lesson.steps.length - 1 && (
          <div style={{
            background: 'linear-gradient(135deg, #00C851, #007E33)',
            color: 'white',
            padding: '30px',
            borderRadius: '20px',
            marginTop: '20px',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              🎉 Parabéns!
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '18px' }}>
              Você concluiu a aula "{lesson.title}"!
            </p>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '15px',
              borderRadius: '15px',
              margin: '0 0 20px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              <StarIcon size={24} />
              +{lesson.xpReward} XP Ganhos{isOfflineMode ? ' (offline)' : ''}!
            </div>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/')}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '2px solid rgba(255,255,255,0.3)',
                  padding: '12px 25px',
                  borderRadius: '25px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <HomeIcon size={16} /> Página Inicial
              </button>

              <button
                onClick={() => navigate('/robot')}
                style={{
                  background: 'white',
                  color: '#00C851',
                  border: 'none',
                  padding: '12px 25px',
                  borderRadius: '25px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: '500'
                }}
              >
                <RobotIcon size={16} /> Controlar Robô
              </button>
            </div>
          </div>
        )}
      </div>

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
};

export default LessonPage;