import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllLessons, checkApiHealth, wakeUpServer } from '../services/api';

const HomePage = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking'); // 'checking', 'online', 'offline', 'waking'
  const [userStats, setUserStats] = useState({
    totalXP: 450,
    currentLevel: 3,
    streak: 7,
    gems: 89,
    lives: 5,
    completedLessons: 2
  });

  const navigate = useNavigate();

  // Dados fallback para quando a API não está disponível
  const fallbackLessons = [
    {
      id: 'robotica-basica',
      title: 'Conceitos Básicos de Robótica',
      description: 'Aprenda os fundamentos da robótica, tipos de robôs e suas aplicações no mundo moderno.',
      duration: 15,
      level: 'Iniciante',
      steps: ['intro', 'conceitos', 'tipos', 'quiz'],
      thumbnail: null
    },
    {
      id: 'introducao-arduino',
      title: 'Introdução ao Arduino',
      description: 'Conheça a plataforma Arduino, componentes e programação básica para criar projetos incríveis.',
      duration: 20,
      level: 'Iniciante',
      steps: ['intro', 'hardware', 'software', 'pratica', 'quiz'],
      thumbnail: null
    },
    {
      id: 'projetos-led',
      title: 'Criando com LEDs',
      description: 'Aprenda a fazer projetos divertidos com LEDs coloridos e efeitos luminosos.',
      duration: 25,
      level: 'Iniciante',
      steps: [], // Vazio = em breve
      thumbnail: null
    },
    {
      id: 'sensores-arduino',
      title: 'Sensores Divertidos',
      description: 'Explore diferentes tipos de sensores e atuadores em projetos de robótica.',
      duration: 30,
      level: 'Intermediário', 
      steps: [], // Vazio = em breve
      thumbnail: null
    }
  ];

  // Verificar se a API está online e acordar se necessário
  const checkAndWakeApi = async () => {
    setApiStatus('checking');
    
    // Primeiro, verificar se a API está online
    const healthCheck = await checkApiHealth();
    
    if (healthCheck.online) {
      console.log('✅ API está online!');
      setApiStatus('online');
      setIsOfflineMode(false);
      return true;
    } else {
      console.log('⚠️ API offline. Tentando acordar servidor...');
      setApiStatus('waking');
      setIsWakingUp(true);
      
      // Tentar acordar o servidor (Render free tier pode estar dormindo)
      const wakeResult = await wakeUpServer();
      
      if (wakeResult) {
        setApiStatus('online');
        setIsOfflineMode(false);
        setIsWakingUp(false);
        return true;
      } else {
        console.log('❌ Não foi possível acordar o servidor. Modo offline ativado.');
        setApiStatus('offline');
        setIsOfflineMode(true);
        setIsWakingUp(false);
        return false;
      }
    }
  };

  // Buscar dados das lições
  const fetchLessons = async (forceWake = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Se forceWake for true ou estivermos em modo offline, tentar acordar a API
      if (forceWake || isOfflineMode) {
        const apiIsOnline = await checkAndWakeApi();
        if (!apiIsOnline) {
          // Se não conseguir acordar, usar fallback
          setLessons(fallbackLessons);
          return;
        }
      }
      
      // Tentar buscar lições da API
      const response = await getAllLessons();

      if (response && response.success && response.data) {
        setLessons(response.data);
        setIsOfflineMode(false);
        setApiStatus('online');
        console.log('✅ Lições carregadas da API!');
      } else {
        throw new Error('Resposta inválida da API');
      }
    } catch (err) {
      console.warn('⚠️ Erro ao carregar lições. Usando modo fallback.');
      console.error('Erro:', err.message);
      
      // Usar dados fallback quando API não está disponível
      setLessons(fallbackLessons);
      setIsOfflineMode(true);
      setApiStatus('offline');
      setError(null); // Não mostrar erro, apenas trabalhar offline
    } finally {
      setLoading(false);
      setIsWakingUp(false);
    }
  };

  // Carregar dados na inicialização
  useEffect(() => {
    fetchLessons();

    // Tentar reconectar a cada 2 minutos se estiver offline
    const retryInterval = setInterval(() => {
      if (isOfflineMode || apiStatus === 'offline') {
        console.log('🔄 Tentando reconectar com a API...');
        fetchLessons(true);
      }
    }, 120000); // 2 minutos

    return () => clearInterval(retryInterval);
  }, []);

  // Ícones SVG
  const RobotIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M12,4A0.5,0.5 0 0,0 11.5,4.5A0.5,0.5 0 0,0 12,5A0.5,0.5 0 0,0 12.5,4.5A0.5,0.5 0 0,0 12,4M6,8.5A1.5,1.5 0 0,1 7.5,10A1.5,1.5 0 0,1 6,11.5A1.5,1.5 0 0,1 4.5,10A1.5,1.5 0 0,1 6,8.5M18,8.5A1.5,1.5 0 0,1 19.5,10A1.5,1.5 0 0,1 18,11.5A1.5,1.5 0 0,1 16.5,10A1.5,1.5 0 0,1 18,8.5Z"/>
    </svg>
  );

  const PlayIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M8,5.14V19.14L19,12.14L8,5.14Z"/>
    </svg>
  );

  const ChatIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12,3C17.5,3 22,6.58 22,11A8,8 0 0,1 14,19H9L3,22V11C3,6.58 7.5,3 12,3Z"/>
    </svg>
  );

  const GamepadIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M7.97,16L5,19C4.67,19.3 4.23,19.5 3.75,19.5A1.75,1.75 0 0,1 2,17.75V17.5L3,10.12C3.21,7.81 5.14,6 7.5,6H16.5C18.86,6 20.79,7.81 21,10.12L22,17.5V17.75A1.75,1.75 0 0,1 20.25,19.5C19.77,19.5 19.33,19.3 19,19L16.03,16H7.97M9.5,8A1.5,1.5 0 0,0 8,9.5A1.5,1.5 0 0,0 9.5,11A1.5,1.5 0 0,0 11,9.5A1.5,1.5 0 0,0 9.5,8M14.5,8A1.5,1.5 0 0,0 13,9.5A1.5,1.5 0 0,0 14.5,11A1.5,1.5 0 0,0 16,9.5A1.5,1.5 0 0,0 14.5,8Z"/>
    </svg>
  );

  const TrophyIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M5,9V21H9V9H5M10,10L16,6L10,2V10M19,7V9L17,10V11H19V15H17V16L19,17V19L16,20.5V18.5H14V20.5L11,19V17L13,16V11L11,10V9L13,8V2L16,3.5V5.5H18V3.5L21,5V7H19Z"/>
    </svg>
  );

  const FireIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M17.66,11.2C17.43,10.9 17.15,10.64 16.89,10.38C16.22,9.78 15.46,9.35 14.82,8.72C13.33,7.26 13,4.85 13.95,3C13.76,3.23 13.58,3.46 13.41,3.69C12.61,4.72 12.49,6.01 12.89,7.22C13.27,8.41 14.04,9.5 14.7,10.6C15.18,11.44 15.54,12.3 15.54,13.28C15.54,14.22 15.05,15.11 14.27,15.65C14.25,15.67 14.24,15.68 14.22,15.7C14.17,15.75 14.12,15.8 14.07,15.84C13.75,16.13 13.39,16.35 13,16.5C12.4,16.74 11.75,16.87 11.1,16.87C10.45,16.87 9.8,16.74 9.2,16.5C8.81,16.35 8.45,16.13 8.13,15.84C8.08,15.8 8.03,15.75 7.98,15.7C7.96,15.68 7.95,15.67 7.93,15.65C7.15,15.11 6.66,14.22 6.66,13.28C6.66,12.3 7.02,11.44 7.5,10.6C8.16,9.5 8.93,8.41 9.31,7.22C9.71,6.01 9.59,4.72 8.79,3.69C8.62,3.46 8.44,3.23 8.25,3C9.2,4.85 8.87,7.26 7.38,8.72C6.74,9.35 5.98,9.78 5.31,10.38C5.05,10.64 4.77,10.9 4.54,11.2C4.26,11.55 4.04,11.94 3.9,12.37C3.69,13.07 3.69,13.82 3.9,14.52C4.04,14.95 4.26,15.34 4.54,15.69C5.05,16.46 5.74,17.07 6.53,17.5C7.5,18.04 8.58,18.32 9.67,18.32C10.76,18.32 11.84,18.04 12.81,17.5C13.6,17.07 14.29,16.46 14.8,15.69C15.08,15.34 15.3,14.95 15.44,14.52C15.65,13.82 15.65,13.07 15.44,12.37C15.3,11.94 15.08,11.55 14.8,11.2H17.66Z"/>
    </svg>
  );

  const GemIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M6,2L2,8L12,22L22,8L18,2H6M12.5,7.5L16.5,3.5H19L21,7H12.5V7.5M11.5,7.5V7H3L5,3.5H7.5L11.5,7.5M5.27,9H9.73L12,19.2L5.27,9M10.27,9H13.73L12,15.7L10.27,9M14.27,9H18.73L12,19.2L14.27,9Z"/>
    </svg>
  );

  const HeartIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"/>
    </svg>
  );

  const StarIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"/>
    </svg>
  );

  const ArrowRightIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"/>
    </svg>
  );

  const LockIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"/>
    </svg>
  );

  // Funções de navegação
  const navigateToLesson = (lessonId) => {
    navigate(`/lessons/${lessonId}`);
  };

  const navigateToPage = (page) => {
    navigate(page);
  };

  // Calcular progresso do nível
  const levelProgress = (userStats.totalXP % 100);
  const nextLevelXP = 100 - levelProgress;

  const containerStyle = {
    background: 'linear-gradient(135deg, #0066CC 0%, #003d7a 100%)',
    minHeight: '100vh',
    color: 'white',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    border: 'none',
    borderRadius: '20px',
    color: '#333',
    marginBottom: '20px'
  };

  const moduleCardStyle = (bgColor) => ({
    background: bgColor,
    border: 'none',
    borderRadius: '20px',
    color: 'white',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    height: '140px',
    padding: '20px',
    marginBottom: '15px'
  });

  const StatCard = ({ icon, value, label, bgColor, iconColor }) => (
    <div className="stat-card" style={{
      textAlign: 'center',
      padding: '8px 6px',
      background: bgColor,
      borderRadius: '10px',
      minHeight: '65px',
      minWidth: '60px',
      flex: '1',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      {icon}
      <div className="stat-card-value" style={{ color: iconColor, fontWeight: 'bold', fontSize: '16px', margin: '2px 0' }}>
        {value}
      </div>
      <small className="stat-card-label" style={{ color: '#666', fontSize: '10px', lineHeight: '1.2' }}>{label}</small>
    </div>
  );

  return (
    <div style={containerStyle}>
      {/* Header com Stats do Usuário */}
      <div style={cardStyle}>
        <div style={{ padding: '25px' }}>
          <div className="header-container" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', flex: '1', minWidth: '300px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '15px'
              }}>
                <RobotIcon size={30} color="white" />
              </div>
              <div>
                <h2 style={{ color: '#0066CC', margin: '0 0 5px 0' }}>Bem-vindo de volta!</h2>
                <p style={{ margin: 0, color: '#666' }}>
                  {apiStatus === 'online' 
                    ? 'Continue sua jornada robótica' 
                    : apiStatus === 'waking' 
                    ? 'Preparando servidor...' 
                    : 'Modo offline - Continue aprendendo!'
                  }
                </p>
              </div>
            </div>
            
            <div className="stats-container" style={{ 
              display: 'flex', 
              gap: '8px',
              minWidth: '280px',
              flexWrap: 'wrap'
            }}>
              <StatCard 
                icon={<FireIcon size={18} color="#FF6B35" />}
                value={userStats.streak}
                label="Sequência"
                bgColor="#FFF3E0"
                iconColor="#FF6B35"
              />
              <StatCard 
                icon={<GemIcon size={18} color="#00C851" />}
                value={userStats.gems}
                label="Gemas"
                bgColor="#E8F5E8"
                iconColor="#00C851"
              />
              <StatCard 
                icon={<HeartIcon size={18} color="#E91E63" />}
                value={userStats.lives}
                label="Vidas"
                bgColor="#FFEBEE"
                iconColor="#E91E63"
              />
              <StatCard 
                icon={<StarIcon size={18} color="#0066CC" />}
                value={userStats.totalXP}
                label="XP Total"
                bgColor="#E3F2FD"
                iconColor="#0066CC"
              />
            </div>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ color: '#0066CC', marginRight: '10px' }}>Nível {userStats.currentLevel}</span>
              <div style={{
                flex: 1,
                height: '8px',
                background: '#e0e0e0',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${levelProgress}%`,
                  height: '100%',
                  background: 'linear-gradient(to right, #FF6B35, #F7931E)',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <small style={{ color: '#666', marginLeft: '10px' }}>
                {nextLevelXP} XP para próximo nível
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Módulos Principais */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '15px',
        marginBottom: '20px'
      }}>
        <div 
          style={moduleCardStyle('linear-gradient(135deg, #FF6B35, #F7931E)')}
          onClick={() => navigateToPage('/lessons')}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '15px'
            }}>
              <PlayIcon size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 5px 0' }}>Lições Interativas</h4>
              <p style={{ margin: '0 0 10px 0', fontSize: '14px', opacity: 0.9 }}>
                Aprenda robótica passo a passo
              </p>
              <span style={{
                background: 'rgba(255, 255, 255, 0.9)',
                color: '#333',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px'
              }}>
                {lessons.length} aulas {apiStatus === 'online' ? 'online' : 'offline'}
              </span>
            </div>
            <ArrowRightIcon size={20} />
          </div>
        </div>
        
        <div 
          style={moduleCardStyle('linear-gradient(135deg, #00C851, #007E33)')}
          onClick={() => navigateToPage('/chat')}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '15px'
            }}>
              <ChatIcon size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 5px 0' }}>Chat com IA</h4>
              <p style={{ margin: '0 0 10px 0', fontSize: '14px', opacity: 0.9 }}>
                Tire dúvidas sobre robótica
              </p>
              <span style={{
                background: 'rgba(255, 255, 255, 0.9)',
                color: '#333',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px'
              }}>
                {apiStatus === 'online' ? 'Powered by Allama' : 'Disponível offline'}
              </span>
            </div>
            <ArrowRightIcon size={20} />
          </div>
        </div>
        
        <div 
          style={moduleCardStyle('linear-gradient(135deg, #E91E63, #AD1457)')}
          onClick={() => navigateToPage('/robot')}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '15px'
            }}>
              <GamepadIcon size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 5px 0' }}>Controle do Robô</h4>
              <p style={{ margin: '0 0 10px 0', fontSize: '14px', opacity: 0.9 }}>
                Controle manual e programação
              </p>
              <span style={{
                background: 'rgba(255, 255, 255, 0.9)',
                color: '#333',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px'
              }}>
                {apiStatus === 'online' ? 'Tempo real' : 'Modo simulação'}
              </span>
            </div>
            <ArrowRightIcon size={20} />
          </div>
        </div>
        
        <div 
          style={moduleCardStyle('linear-gradient(135deg, #9C27B0, #673AB7)')}
          onClick={() => navigateToPage('/dashboard')}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '15px'
            }}>
              <TrophyIcon size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 5px 0' }}>Meu Progresso</h4>
              <p style={{ margin: '0 0 10px 0', fontSize: '14px', opacity: 0.9 }}>
                Estatísticas e conquistas
              </p>
              <span style={{
                background: 'rgba(255, 255, 255, 0.9)',
                color: '#333',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px'
              }}>
                Nível {userStats.currentLevel}
              </span>
            </div>
            <ArrowRightIcon size={20} />
          </div>
        </div>
      </div>

      {/* Seção de Aulas */}
      <div style={cardStyle}>
        <div style={{ padding: '25px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h3 style={{ color: '#0066CC', margin: '0 0 8px 0' }}>Suas Aulas</h3>
              <p style={{ color: '#666', margin: 0 }}>
                {apiStatus === 'online' 
                  ? 'Continue de onde parou ou comece uma nova aventura'
                  : apiStatus === 'waking'
                  ? 'Carregando aulas do servidor...'
                  : 'Modo offline - suas aulas estão disponíveis!'
                }
              </p>
            </div>
            <button 
              onClick={() => navigateToPage('/lessons')}
              style={{
                background: 'transparent',
                border: '2px solid #0066CC',
                color: '#0066CC',
                padding: '10px 20px',
                borderRadius: '25px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#0066CC';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#0066CC';
              }}
            >
              Ver Todas <ArrowRightIcon size={16} />
            </button>
          </div>

          {loading || isWakingUp ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #0066CC',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 15px'
              }} />
              <p style={{ color: '#666' }}>
                {isWakingUp 
                  ? 'Acordando servidor Render... (pode levar até 1 minuto)'
                  : 'Carregando aulas...'
                }
              </p>
            </div>
          ) : error ? (
            <div style={{
              background: '#ffebee',
              color: '#c62828',
              padding: '15px',
              borderRadius: '15px',
              border: '1px solid #ffcdd2'
            }}>
              {error}
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '20px' 
            }}>
              {lessons.slice(0, 4).map((lesson, index) => (
                <div 
                  key={lesson.id}
                  style={{
                    border: '2px solid #f0f0f0',
                    borderRadius: '15px',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    background: 'white',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,102,204,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  onClick={() => navigateToLesson(lesson.id)}
                >
                  {lesson.thumbnail ? (
                    <img
                      src={lesson.thumbnail}
                      alt={lesson.title}
                      style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/imagem3.jpg';
                      }}
                    />
                  ) : (
                    <div style={{
                      height: '150px',
                      background: `linear-gradient(135deg, ${index % 2 === 0 ? '#FF6B35' : '#00C851'}, ${index % 2 === 0 ? '#F7931E' : '#007E33'})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <RobotIcon size={48} color="white" />
                    </div>
                  )}
                  
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px', flexWrap: 'wrap', gap: '5px' }}>
                      <span style={{
                        background: index < userStats.completedLessons ? '#00C851' : '#666',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px'
                      }}>
                        {index < userStats.completedLessons ? 'Concluída' : lesson.level || 'Iniciante'}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        {index < userStats.completedLessons && (
                          <StarIcon color="#FFD700" size={18} />
                        )}
                        {apiStatus !== 'online' && (
                          <span style={{
                            background: '#FFF3E0',
                            color: '#FF6B35',
                            padding: '2px 6px',
                            borderRadius: '8px',
                            fontSize: '10px'
                          }}>
                            OFFLINE
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <h4 style={{ color: '#0066CC', margin: '0 0 10px 0', fontSize: '16px' }}>
                      {lesson.title}
                    </h4>
                    <p style={{ color: '#666', margin: '0 0 15px 0', fontSize: '14px', lineHeight: '1.4' }}>
                      {lesson.description}
                    </p>
                    
                    {lesson.duration && (
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                        <PlayIcon size={12} color="#666" />
                        <small style={{ color: '#666', marginLeft: '5px' }}>
                          {lesson.duration} min
                        </small>
                      </div>
                    )}
                    
                    {lesson.steps && lesson.steps.length > 0 ? (
                      <button 
                        style={{
                          width: '100%',
                          background: index < userStats.completedLessons ? 'transparent' : '#0066CC',
                          border: index < userStats.completedLessons ? '2px solid #00C851' : 'none',
                          color: index < userStats.completedLessons ? '#00C851' : 'white',
                          padding: '10px',
                          borderRadius: '25px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          transition: 'all 0.2s'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateToLesson(lesson.id);
                        }}
                      >
                        {index < userStats.completedLessons ? 'Revisar' : 'Iniciar'} 
                        <ArrowRightIcon size={16} />
                      </button>
                    ) : (
                      <button 
                        disabled
                        style={{
                          width: '100%',
                          background: '#f5f5f5',
                          border: 'none',
                          color: '#999',
                          padding: '10px',
                          borderRadius: '25px',
                          cursor: 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                      >
                        Em breve <LockIcon size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @media (max-width: 768px) {
            .stats-container {
              gap: 4px !important;
              min-width: 240px !important;
            }
            
            .stat-card {
              min-width: 50px !important;
              padding: 6px 4px !important;
              min-height: 55px !important;
            }
            
            .stat-card-value {
              font-size: 14px !important;
            }
            
            .stat-card-label {
              font-size: 9px !important;
            }
            
            .header-container {
              flex-direction: column !important;
              align-items: flex-start !important;
              gap: 15px !important;
            }
          }
          
          @media (max-width: 480px) {
            .stats-container {
              gap: 2px !important;
              min-width: 200px !important;
            }
            
            .stat-card {
              min-width: 45px !important;
              padding: 4px 2px !important;
              min-height: 50px !important;
            }
            
            .stat-card-value {
              font-size: 12px !important;
            }
            
            .stat-card-label {
              font-size: 8px !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default HomePage;