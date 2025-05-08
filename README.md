# Edu-Ardu: Plataforma Educacional de Robótica

Edu-Ardu é uma aplicação web educacional para ensinar robótica e Arduino para crianças, combinando teoria e prática através de um chatbot interativo que pode ser integrado a um robô físico.

## Estrutura do Projeto

```
Edu-Ardu/
├── backend/                # Servidor Node.js
│   ├── src/
│   │   ├── controllers/    # Controladores da API
│   │   ├── data/           # Dados estáticos (aulas)
│   │   ├── routes/         # Rotas da API
│   │   ├── services/       # Serviços (Arduino)
│   │   ├── socket/         # Configuração Socket.io
│   │   └── index.js        # Ponto de entrada do servidor
│   └── package.json        # Dependências do backend
│
├── frontend/               # Aplicação React
│   ├── public/             # Arquivos estáticos
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── services/       # Serviços (API, Socket)
│   │   └── styles/         # Arquivos CSS
│   └── package.json        # Dependências do frontend
│
├── arduino/                # Código para o Arduino
│   └── EduArduRobot.ino    # Programa do robô
│
└── package.json            # Scripts para executar o projeto completo
```

## Pré-requisitos

- Node.js (v14 ou superior)
- npm ou yarn
- Arduino IDE (para carregar o código no robô)
- Um robô Arduino com módulo Bluetooth ou porta serial (opcional para testes)

## Comandos para Execução

### Instalação Inicial

```bash
# Instalar dependências do projeto raiz
npm install

# Instalar todas as dependências (raiz, frontend e backend)
npm run install-all
```

### Execução do Projeto

```bash
# Iniciar backend e frontend simultaneamente (recomendado para desenvolvimento)
npm run dev

# Iniciar apenas o backend
npm run server

# Iniciar apenas o frontend
npm run client

# Iniciar em modo produção (apenas backend, que serve também o frontend compilado)
npm start
```

### Navegação entre Pastas

```bash
# Ir para a pasta do backend
cd backend

# Ir para a pasta do frontend
cd frontend

# Voltar à pasta raiz a partir de qualquer subpasta
cd ..
```

## Acesso à Aplicação

- **Frontend**: http://localhost:3000
- **API Backend**: http://localhost:5000/api
- **Verificação de saúde da API**: http://localhost:5000/health

## Funcionalidades Principais

1. **Aulas Interativas**: Aprenda sobre Arduino e robótica com aulas interativas
2. **Controle do Robô**: Interface para controlar um robô Arduino via Bluetooth/Serial
3. **Chat Educacional**: Conversa com o robô para fazer perguntas sobre robótica
4. **Modo de Simulação**: Teste sem um robô físico conectado

## Configuração do Arduino

1. Abra o arquivo `arduino/EduArduRobot.ino` no Arduino IDE
2. Conecte o Arduino ao computador via USB
3. Selecione a placa e porta corretas no Arduino IDE
4. Carregue o código para o Arduino

## Observações

- Se você não tiver um robô Arduino, pode usar o modo de simulação
- O sistema funciona melhor com o Chrome devido ao suporte ao Web Serial API
- Para testar com um simulador Arduino, recomendamos usar o [Wokwi](https://wokwi.com/)

## Solução de Problemas

### Erros no Backend
- Verifique se todas as dependências foram instaladas
- Certifique-se de que o arquivo `.env` está configurado corretamente
- Verifique permissões de acesso à porta serial (em sistemas Linux/MacOS)

### Erros no Frontend
- Limpe o cache do navegador
- Verifique o console do navegador para erros
- Certifique-se de que o backend está rodando antes de usar funcionalidades de comunicação

### Erros de Conexão com Arduino
- Verifique se a porta serial está correta
- Certifique-se de que o baudrate corresponde ao configurado no Arduino (9600 por padrão)
- Teste o Arduino com o Serial Monitor da Arduino IDE para confirmar seu funcionamento