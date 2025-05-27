import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { FaRobot, FaHome, FaBook, FaComments, FaGamepad, FaTrophy } from 'react-icons/fa';
import { SocketContext } from '../services/socket';
import { checkApiHealth, wakeUpServer } from '../services/api';

const Header = () => {
  const location = useLocation();
  const { robotStatus } = useContext(SocketContext);
  
  // Estados para o status da API
  const [apiStatus, setApiStatus] = useState('checking'); // 'checking', 'online', 'offline', 'waking'
  const [isWakingUp, setIsWakingUp] = useState(false);

  // Verificar se a API está online e acordar se necessário
  const checkAndWakeApi = async () => {
    setApiStatus('checking');
    
    const healthCheck = await checkApiHealth();
    
    if (healthCheck.online) {
      setApiStatus('online');
      return true;
    } else {
      setApiStatus('waking');
      setIsWakingUp(true);
      
      const wakeResult = await wakeUpServer();
      
      if (wakeResult) {
        setApiStatus('online');
        setIsWakingUp(false);
        return true;
      } else {
        setApiStatus('offline');
        setIsWakingUp(false);
        return false;
      }
    }
  };

  // Verificar API na inicialização e periodicamente
  useEffect(() => {
    checkAndWakeApi();

    const retryInterval = setInterval(() => {
      if (apiStatus === 'offline') {
        checkAndWakeApi();
      }
    }, 120000); // 2 minutos

    return () => clearInterval(retryInterval);
  }, []);

  // Determinar classe de status para o indicador de robô
  const getRobotStatusClass = () => {
    if (robotStatus.connected) {
      return 'status-connected';
    } else if (robotStatus.simulationMode) {
      return 'status-simulation';
    } else {
      return 'status-disconnected';
    }
  };

  // Texto do status do robô
  const getRobotStatusText = () => {
    if (robotStatus.connected && !robotStatus.simulationMode) {
      return 'Conectado';
    } else if (robotStatus.simulationMode) {
      return 'Simulação';
    } else {
      return 'Desconectado';
    }
  };

  // Ícones SVG customizados
  const WifiIcon = ({ size = 16, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12,21L15.6,16.2C14.6,15.45 13.35,15 12,15C10.65,15 9.4,15.45 8.4,16.2L12,21M12,3C7.95,3 4.21,4.34 1.2,6.6L3,9C5.5,7.12 8.62,6 12,6C15.38,6 18.5,7.12 21,9L22.8,6.6C19.79,4.34 16.05,3 12,3M12,9C9.3,9 6.81,9.89 4.8,11.4L6.6,13.8C8.1,12.67 9.97,12 12,12C14.03,12 15.9,12.67 17.4,13.8L19.2,11.4C17.19,9.89 14.7,9 12,9Z"/>
    </svg>
  );

  const RobotIcon = ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M12,4A0.5,0.5 0 0,0 11.5,4.5A0.5,0.5 0 0,0 12,5A0.5,0.5 0 0,0 12.5,4.5A0.5,0.5 0 0,0 12,4M6,8.5A1.5,1.5 0 0,1 7.5,10A1.5,1.5 0 0,1 6,11.5A1.5,1.5 0 0,1 4.5,10A1.5,1.5 0 0,1 6,8.5M18,8.5A1.5,1.5 0 0,1 19.5,10A1.5,1.5 0 0,1 18,11.5A1.5,1.5 0 0,1 16.5,10A1.5,1.5 0 0,1 18,8.5Z"/>
    </svg>
  );

  const RefreshIcon = ({ size = 16, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>
    </svg>
  );

  // Função para tentar reconectar manualmente
  const handleRetryConnection = () => {
    checkAndWakeApi();
  };

  // Menu de navegação
  const navItems = [
    { path: '/', icon: FaHome, label: 'Início' },
    { path: '/lessons', icon: FaBook, label: 'Lições' },
    { path: '/chat', icon: FaComments, label: 'Chat IA' },
    { path: '/robot', icon: FaGamepad, label: 'Controle' },
    { path: '/dashboard', icon: FaTrophy, label: 'Progresso' }
  ];

  // Estilos do componente
  const styles = {
    header: {
      background: 'linear-gradient(135deg, #0066CC 0%, #003d7a 100%)',
      color: 'white',
      boxShadow: '0 4px 20px rgba(0,102,204,0.3)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      border: 'none'
    },
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '15px 0',
      flexWrap: 'wrap',
      gap: '15px'
    },
    brandLink: {
      display: 'flex',
      alignItems: 'center',
      textDecoration: 'none',
      color: 'inherit'
    },
    logoContainer: {
      width: '45px',
      height: '45px',
      background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '12px',
      boxShadow: '0 4px 15px rgba(255,107,53,0.3)',
      transition: 'transform 0.3s ease'
    },
    brandText: {
      margin: 0,
      fontSize: '24px',
      fontWeight: 'bold',
      background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    brandSubtext: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: '12px',
      display: 'block',
      marginTop: '-2px'
    },
    nav: {
      display: 'flex',
      gap: '5px',
      background: 'rgba(255,255,255,0.1)',
      borderRadius: '25px',
      padding: '8px',
      backdropFilter: 'blur(10px)'
    },
    navLink: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '10px 16px',
      borderRadius: '20px',
      textDecoration: 'none',
      transition: 'all 0.3s ease',
      fontSize: '14px'
    },
    statusContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px'
    },
    statusBox: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: 'rgba(255,255,255,0.1)',
      borderRadius: '20px',
      padding: '8px 12px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.2)'
    },
    statusInner: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    statusText: {
      fontSize: '12px',
      fontWeight: '500'
    },
    statusDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%'
    },
    spinner: {
      width: '16px',
      height: '16px',
      border: '2px solid transparent',
      borderTop: '2px solid #FFC107',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    retryButton: {
      background: 'transparent',
      border: 'none',
      color: 'rgba(255,255,255,0.8)',
      cursor: 'pointer',
      padding: '2px',
      display: 'flex',
      alignItems: 'center'
    },
    portBadge: {
      background: 'rgba(255,255,255,0.2)',
      color: 'white',
      padding: '2px 6px',
      borderRadius: '8px',
      fontSize: '10px'
    }
  };

  // Função para obter estilo do link de navegação
  const getNavLinkStyle = (path) => ({
    ...styles.navLink,
    color: location.pathname === path ? '#0066CC' : 'rgba(255,255,255,0.9)',
    background: location.pathname === path ? 'white' : 'transparent',
    fontWeight: location.pathname === path ? '600' : '400',
    boxShadow: location.pathname === path ? '0 4px 15px rgba(255,255,255,0.2)' : 'none'
  });

  // Função para obter cor do status da API
  const getApiStatusColor = () => {
    switch (apiStatus) {
      case 'online': return '#00C851';
      case 'waking':
      case 'checking': return '#FFC107';
      case 'offline': return '#DC3545';
      default: return '#6C757D';
    }
  };

  // Função para obter cor do status do robô
  const getRobotStatusColor = () => {
    if (robotStatus.connected) return '#00C851';
    if (robotStatus.simulationMode) return '#FFC107';
    return '#DC3545';
  };

  return (
    <header style={styles.header}>
      <Container>
        <div style={styles.container}>
          
          {/* Logo e Nome */}
          <Link to="/" style={styles.brandLink}>
            <div 
              style={styles.logoContainer}
              onMouseEnter={(e) => e.target.style.transform = 'rotate(5deg) scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'rotate(0deg) scale(1)'}
            >
              <RobotIcon size={24} color="white" />
            </div>
            <div>
              <h1 style={styles.brandText}>
                Edu-Ardu
              </h1>
              <small style={styles.brandSubtext}>
                Robótica Educacional
              </small>
            </div>
          </Link>

          {/* Navegação Principal */}
          <nav style={styles.nav}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                style={getNavLinkStyle(item.path)}
                onMouseEnter={(e) => {
                  if (location.pathname !== item.path) {
                    e.target.style.background = 'rgba(255,255,255,0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (location.pathname !== item.path) {
                    e.target.style.background = 'transparent';
                  }
                }}
              >
                <item.icon size={16} />
                <span style={{ display: window.innerWidth > 768 ? 'inline' : 'none' }}>
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Status da API e Robô */}
          <div style={styles.statusContainer}>
            
            {/* Status da API */}
            <div style={styles.statusBox}>
              <div style={styles.statusInner}>
                {apiStatus === 'online' ? (
                  <WifiIcon size={16} color="#00C851" />
                ) : apiStatus === 'waking' || apiStatus === 'checking' ? (
                  <div style={styles.spinner} />
                ) : (
                  <div style={{
                    ...styles.statusDot,
                    background: '#DC3545'
                  }} />
                )}
                
                <span style={{
                  ...styles.statusText,
                  color: getApiStatusColor()
                }}>
                  {apiStatus === 'online' ? 'Online' : 
                   apiStatus === 'waking' ? 'Conectando...' :
                   apiStatus === 'checking' ? 'Verificando...' : 'Offline'}
                </span>
              </div>
              
              {(apiStatus === 'offline') && (
                <button
                  onClick={handleRetryConnection}
                  disabled={isWakingUp}
                  style={{
                    ...styles.retryButton,
                    cursor: isWakingUp ? 'not-allowed' : 'pointer'
                  }}
                  title="Tentar reconectar"
                >
                  <RefreshIcon size={14} />
                </button>
              )}
            </div>

            {/* Status do Robô */}
            <div style={styles.statusBox}>
              <div style={{
                ...styles.statusDot,
                background: getRobotStatusColor()
              }} />
              <span style={{
                ...styles.statusText,
                color: 'rgba(255,255,255,0.9)'
              }}>
                {getRobotStatusText()}
              </span>
              {robotStatus.port && !robotStatus.simulationMode && (
                <span style={styles.portBadge}>
                  {robotStatus.port}
                </span>
              )}
            </div>
          </div>
        </div>
      </Container>

      {/* CSS para animações e responsividade */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @media (max-width: 768px) {
            nav span {
              display: none !important;
            }
            
            nav a {
              padding: 8px 12px !important;
            }
          }
          
          @media (max-width: 576px) {
            .header-container {
              flex-direction: column !important;
              align-items: center !important;
              gap: 10px !important;
            }
            
            nav {
              gap: 3px !important;
              padding: 6px !important;
            }
            
            nav a {
              padding: 6px 8px !important;
            }
          }
        `}
      </style>
    </header>
  );
};

export default Header;