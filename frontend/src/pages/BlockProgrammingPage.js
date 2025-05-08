import React, { useState } from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCode } from 'react-icons/fa';
import BlocklyEditor from '../components/BlocklyEditor';

const BlockProgrammingPage = () => {
  const navigate = useNavigate();
  const [generatedCode, setGeneratedCode] = useState('');

  const goBackToControl = () => {
    navigate('/robot-control');
  };

  const handleCodeChange = (newCode) => {
    setGeneratedCode(newCode);
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">
        <FaCode className="me-2" /> Programação em Blocos para o Edu-Ardu
      </h1>
      
      <Row className="mb-4">
        <Col>
          <Button
            variant="secondary"
            onClick={goBackToControl}
            className="me-2"
          >
            <FaArrowLeft className="me-2" /> Voltar ao Controle
          </Button>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header>Editor de Blocos</Card.Header>
            <Card.Body>
              <BlocklyEditor onCodeChange={handleCodeChange} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Header>Código Gerado</Card.Header>
            <Card.Body>
              <pre className="bg-light p-3 rounded">
                {generatedCode || 'Arraste e conecte blocos para gerar código.'}
              </pre>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default BlockProgrammingPage;