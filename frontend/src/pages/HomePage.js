import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaRobot, FaArrowRight, FaLock } from 'react-icons/fa';
import { getAllLessons } from '../services/api';
import '../styles/HomePage.css';

const HomePage = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Buscar aulas ao carregar a página
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        const response = await getAllLessons();

        if (response.success) {
          setLessons(response.data);
        } else {
          setError('Erro ao carregar as aulas');
        }
      } catch (err) {
        console.error('Error fetching lessons:', err);
        setError('Não foi possível carregar as aulas. Por favor, tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  // Função para navegar para uma aula
  const navigateToLesson = id => {
    navigate(`/lessons/${id}`);
  };

  // Função para navegar para o controle do robô
  const navigateToRobot = () => {
    navigate('/robot');
  };

  return (
    <Container className="home-page">
      {/* Seção de Boas-vindas */}
      <section className="welcome-section">
        <Row className="align-items-center">
          <Col md={6}>
            <h1>Bem-vindo ao Edu-Ardu!</h1>
            <p className="lead">
              Aprenda robótica e Arduino de forma divertida e interativa. Controle um robô real,
              faça projetos incríveis e mergulhe no fascinante mundo da robótica educacional!
            </p>
            <Button
              variant="success"
              size="lg"
              className="mt-3 me-3"
              onClick={() => navigateToLesson('robotica-basica')}
            >
              Iniciar Aprendizado <FaArrowRight />
            </Button>
            <Button variant="outline-primary" size="lg" className="mt-3" onClick={navigateToRobot}>
              Controlar Robô <FaRobot />
            </Button>
          </Col>
          <Col md={6} className="text-center">
            <img
              src="/images/imagem1.jpg"
              alt="Robô Edu-Ardu"
              className="welcome-image"
              onError={e => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
          </Col>
        </Row>
      </section>

      {/* Seção de Aulas */}
      <section className="lessons-section mt-5">
        <h2>Nossas Aulas</h2>
        <p>Escolha uma aula para começar sua jornada na robótica:</p>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
            <p className="mt-3">Carregando aulas...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : (
          <Row className="mt-4">
            {lessons.map(lesson => (
              <Col key={lesson.id} md={6} lg={4} className="mb-4">
                <Card className="lesson-card h-100">
                  <div className="lesson-thumbnail">
                    {lesson.thumbnail ? (
                      <Card.Img
                        variant="top"
                        src={lesson.thumbnail}
                        alt={lesson.title}
                        onError={e => {
                          e.target.onerror = null;
                          e.target.src = '/images/imagem3.jpg';
                        }}
                      />
                    ) : (
                      <div className="placeholder-image d-flex align-items-center justify-content-center">
                        <FaRobot size={48} />
                      </div>
                    )}
                    <div className="lesson-level">{lesson.level || 'iniciante'}</div>
                  </div>

                  <Card.Body>
                    <Card.Title>{lesson.title}</Card.Title>
                    <Card.Text>{lesson.description}</Card.Text>

                    <div className="lesson-meta">
                      {lesson.duration && <span className="duration">{lesson.duration} min</span>}
                    </div>
                  </Card.Body>

                  <Card.Footer className="bg-white border-0">
                    {lesson.steps && lesson.steps.length > 0 ? (
                      <Button
                        variant="primary"
                        onClick={() => navigateToLesson(lesson.id)}
                        className="w-100"
                      >
                        Iniciar Aula <FaArrowRight />
                      </Button>
                    ) : (
                      <Button variant="secondary" disabled className="w-100">
                        Em breve <FaLock />
                      </Button>
                    )}
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </section>

      {/* Seção "Sobre o Projeto" */}
      <section className="about-section mt-5 mb-5">
        <h2>Sobre o Edu-Ardu</h2>
        <Row>
          <Col md={12}>
            <p>
              O Edu-Ardu é um projeto educacional que combina um aplicativo web interativo com um
              robô físico baseado em Arduino para ensinar conceitos de robótica e programação para
              crianças e iniciantes de todas as idades.
            </p>
            <p>Com o Edu-Ardu, você pode:</p>
            <ul>
              <li>Aprender conceitos básicos de robótica de forma divertida</li>
              <li>Controlar um robô real através do navegador</li>
              <li>Criar seus próprios projetos com Arduino</li>
              <li>Conversar com o robô e fazer perguntas sobre robótica</li>
            </ul>
          </Col>
        </Row>
      </section>
    </Container>
  );
};

export default HomePage;
