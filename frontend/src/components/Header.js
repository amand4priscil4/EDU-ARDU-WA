import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navbar, Container, Nav, Badge } from 'react-bootstrap';
import { FaRobot, FaHome } from 'react-icons/fa';
import { SocketContext } from '../services/socket';
import '../styles/Header.css';

const Header = () => {
  const location = useLocation();
  const { robotStatus } = useContext(SocketContext);

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

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="edu-ardu-header">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <img
            src="/images/edu-ardu-logo.png"
            alt="Edu-Ardu Logo"
            className="header-logo"
            onError={e => {
              e.target.onerror = null;
              e.target.src = '/images/fallback-logo.png';
            }}
          />
          Edu-Ardu
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" className={location.pathname === '/' ? 'active' : ''}>
              <FaHome /> Início
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/robot-control"
              className={location.pathname === '/robot-control' ? 'active' : ''}
            >
              <FaRobot /> Controle do Robô
            </Nav.Link>
          </Nav>

          <div className="robot-status-indicator">
            <div className={`status-dot ${getRobotStatusClass()}`}></div>
            <span className="status-text">
              {getRobotStatusText()}
              {robotStatus.port && !robotStatus.simulationMode && (
                <Badge bg="info" className="ms-2">
                  {robotStatus.port}
                </Badge>
              )}
            </span>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;