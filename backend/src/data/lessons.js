/**
 * Dados das aulas do Edu-Ardu - Versão Aprimorada
 * Estrutura completa com gamificação e recursos avançados
 */

const lessons = [
  {
    id: 'robotica-basica',
    title: 'Conceitos Básicos de Robótica',
    description: 'Aprenda os fundamentos da robótica, tipos de robôs e suas aplicações no mundo moderno',
    level: 'iniciante',
    thumbnail: '/images/imagem4.jpg',
    duration: 15,
    
    // 🎮 GAMIFICAÇÃO COMPLETA
    xpReward: 50,           // XP total da lição
    xpPerStep: 3,           // XP base por step
    bonusXP: 10,            // XP bonus por acertos consecutivos
    gemsReward: 5,          // Gemas ganhas na conclusão
    livesRequired: 1,       // Vidas necessárias para começar
    
    // 📚 METADADOS EDUCACIONAIS
    difficulty: 1,          // Dificuldade 1-5
    tags: ['conceitos', 'básico', 'introdução'],
    prerequisites: [],      // Lições necessárias antes desta
    nextLessons: ['introducao-arduino'], // Próximas lições sugeridas
    estimatedTime: '12-18 min', // Tempo real estimado
    
    // 🤖 INTEGRAÇÃO IA ALLAMA
    chatContext: 'Esta lição ensina conceitos básicos de robótica. O aluno está aprendendo sobre sensores, cérebro e atuadores.',
    suggestedQuestions: [
      'O que são sensores em robótica?',
      'Como funciona o cérebro de um robô?',
      'Quais tipos de atuadores existem?'
    ],
    
    // 📊 ANALYTICS
    averageCompletionTime: 14, // minutos
    difficultyRating: 4.2,     // 1-5 estrelas
    completionRate: 87,        // porcentagem
    
    steps: [
      {
        id: 1,
        type: 'texto',
        message: 'Olá! Eu sou o Robo-Duino e vou te ensinar sobre robótica! 🤖 Você está pronto para nossa aventura no mundo dos robôs?',
        
        // 🎮 GAMIFICAÇÃO POR STEP
        xpReward: 3,
        stepProgress: 5, // porcentagem do progresso
        
        // 🤖 INTEGRAÇÃO IA
        aiHints: ['Se tiver dúvidas, pergunte sobre robótica!'],
        
        options: [
          {
            text: 'Sim, quero aprender!',
            isCorrect: true,
            response: 'Ótimo! Vamos começar nossa jornada no mundo da robótica!',
            xpBonus: 2,
            gemsBonus: 1
          },
          {
            text: 'O que é robótica?',
            isCorrect: true, // Ambas corretas
            response: 'Excelente pergunta! Vamos descobrir juntos o que é robótica.',
            xpBonus: 2,
            gemsBonus: 1
          }
        ]
      },
      
      {
        id: 2,
        type: 'texto',
        message: 'Primeiro, vamos entender: O que é robótica? 🤔\n\nRobótica é a ciência que estuda como criar e controlar robôs! Os robôs são máquinas especiais que podemos programar para fazer tarefas, como mover objetos, explorar lugares ou até ajudar pessoas.',
        image: '/images/imagem3.jpg',
        
        xpReward: 3,
        stepProgress: 10,
        
        // 🔍 RECURSOS EXTRAS
        funFacts: [
          'A palavra "robô" vem do tcheco "robota" que significa trabalho forçado',
          'O primeiro robô foi criado em 1954!'
        ],
        relatedConcepts: ['automação', 'inteligência artificial', 'mecatrônica']
      },
      
      {
        id: 3,
        type: 'pergunta',
        message: 'Você já viu algum robô no seu dia a dia ou em filmes? Conte para mim!',
        waitForAnswer: true,
        
        xpReward: 5, // Mais XP para perguntas abertas
        stepProgress: 15,
        
        // 🎯 VALIDAÇÃO INTELIGENTE
        keywordHints: ['aspirador', 'filme', 'brinquedo', 'industrial'],
        minAnswerLength: 10,
        
        // 🤖 INTEGRAÇÃO IA
        aiAnalysis: true, // IA Allama analisará a resposta
        
        feedback: {
          excellent: 'Que resposta incrível! +3 XP bonus',
          good: 'Boa resposta! +2 XP bonus',
          basic: 'Obrigado por compartilhar! +1 XP bonus'
        }
      },
      
      {
        id: 7,
        type: 'opcoes',
        message: 'Qual destas é uma parte principal de um robô?',
        
        xpReward: 4,
        stepProgress: 35,
        
        // ⚡ TIMEOUT E VIDAS
        timeLimit: 30, // segundos
        livesLost: 1,   // vidas perdidas se errar
        
        options: [
          {
            text: 'Bateria',
            isCorrect: false,
            response: 'A bateria é importante, mas não é uma das 3 partes principais. As partes principais são: sensores, cérebro (computador) e atuadores (motores).',
            livesLost: 1,
            xpLost: 1
          },
          {
            text: 'Sensores',
            isCorrect: true,
            response: 'Correto! Os sensores são como os "sentidos" do robô. Eles ajudam o robô a "perceber" o mundo ao seu redor.',
            xpBonus: 3,
            gemsBonus: 1,
            streakBonus: true
          },
          {
            text: 'Rodas',
            isCorrect: false,
            response: 'As rodas são um tipo de atuador, mas não são uma das 3 partes principais em si.',
            livesLost: 1,
            xpLost: 1
          }
        ]
      },
      
      {
        id: 15,
        type: 'comando-robo',
        message: 'Vamos ver se conseguimos fazer o robô acender um LED! Clique no botão abaixo para tentar:',
        robotCommand: 'LED_ON',
        
        xpReward: 8, // Mais XP para comandos robô
        stepProgress: 90,
        
        // 🤖 COMANDO ROBO AVANÇADO
        robotCommands: [
          {
            command: 'LED_ON',
            displayName: 'Acender LED',
            description: 'Liga o LED do robô',
            icon: '💡',
            color: '#FFD700'
          }
        ],
        
        // 🔧 TROUBLESHOOTING
        troubleshooting: [
          {
            problem: 'LED não acende',
            solutions: ['Verificar conexão', 'Verificar se robô está ligado']
          }
        ],
        
        successMessage: 'Perfeito! O LED acendeu! +5 XP bonus',
        errorMessage: 'Ops! Vamos tentar novamente. Verifique a conexão do robô.'
      }
    ]
  },
  
  {
    id: 'introducao-arduino',
    title: 'Introdução ao Arduino',
    description: 'Aprenda o que é um Arduino e como ele funciona na prática',
    level: 'iniciante',
    thumbnail: '/images/imagem3.jpg',
    duration: 20,
    
    // 🎮 GAMIFICAÇÃO
    xpReward: 75,           // Mais XP que a primeira lição
    xpPerStep: 4,
    bonusXP: 15,
    gemsReward: 8,
    livesRequired: 1,
    
    // 📚 METADADOS
    difficulty: 2,
    tags: ['arduino', 'programação', 'eletrônica'],
    prerequisites: ['robotica-basica'],
    nextLessons: ['projetos-led', 'sensores-arduino'],
    
    // 🤖 INTEGRAÇÃO IA
    chatContext: 'Esta lição ensina Arduino básico. O aluno está aprendendo sobre programação e circuitos.',
    suggestedQuestions: [
      'Como programar um Arduino?',
      'O que é um sketch no Arduino?',
      'Como conectar um LED ao Arduino?'
    ],
    
    steps: [
      // Steps com estrutura similar, mas conteúdo de Arduino
      {
        id: 1,
        type: 'texto',
        message: 'Olá novamente! Agora que você já conhece os conceitos básicos de robótica, vamos aprender sobre o Arduino! 🤖',
        xpReward: 4,
        stepProgress: 5,
        options: [
          {
            text: 'Sim, estou pronto!',
            isCorrect: true,
            response: 'Ótimo! Vamos começar nossa jornada pelo mundo do Arduino!',
            xpBonus: 2
          }
        ]
      }
      // ... mais steps
    ]
  },
  
  // 🚀 LIÇÕES FUTURAS COM PREVIEW
  {
    id: 'projetos-led',
    title: 'Criando com LEDs',
    description: 'Aprenda a fazer projetos divertidos com LEDs coloridos',
    level: 'iniciante',
    thumbnail: '/images/imagem2.jpg',
    duration: 25,
    xpReward: 60,
    
    // 🔒 SISTEMA DE DESBLOQUEIO
    locked: true,
    unlockRequirements: {
      completedLessons: ['robotica-basica', 'introducao-arduino'],
      minimumXP: 100,
      minimumLevel: 2
    },
    
    preview: {
      description: 'Nesta lição você aprenderá a criar semáforos, luzes piscantes e efeitos luminosos incríveis!',
      features: ['Semáforo inteligente', 'Luzes de festa', 'Display LED']
    },
    
    steps: [] // Será preenchido quando desbloqueado
  },
  
  {
    id: 'sensores-arduino',
    title: 'Sensores Divertidos',
    description: 'Aprenda a usar sensores para criar projetos interativos',
    level: 'intermediário',
    thumbnail: '/images/imagem1.jpg',
    duration: 30,
    xpReward: 90,
    
    locked: true,
    unlockRequirements: {
      completedLessons: ['projetos-led'],
      minimumXP: 200,
      minimumLevel: 3
    },
    
    preview: {
      description: 'Explore sensores de luz, som, movimento e temperatura!',
      features: ['Detector de movimento', 'Termômetro digital', 'Sensor de luz']
    },
    
    steps: []
  }
];

// 🎯 CONFIGURAÇÕES GLOBAIS DA GAMIFICAÇÃO
const gamificationConfig = {
  levels: {
    1: { name: 'Iniciante', minXP: 0, badge: '🤖' },
    2: { name: 'Explorador', minXP: 100, badge: '🔍' },
    3: { name: 'Construtor', minXP: 250, badge: '🔧' },
    4: { name: 'Inventor', minXP: 500, badge: '💡' },
    5: { name: 'Mestre Robótico', minXP: 1000, badge: '🏆' }
  },
  
  achievements: [
    {
      id: 'first_lesson',
      name: 'Primeira Lição',
      description: 'Complete sua primeira lição',
      icon: '🎯',
      xpReward: 10
    },
    {
      id: 'robot_commander',
      name: 'Comandante Robô',
      description: 'Execute 5 comandos no robô',
      icon: '🤖',
      xpReward: 25
    },
    {
      id: 'streak_master',
      name: 'Mestre da Sequência',
      description: 'Mantenha uma sequência de 7 dias',
      icon: '🔥',
      gemsReward: 50
    }
  ],
  
  streakRewards: {
    3: { gems: 5, message: 'Sequência de 3 dias! 🔥' },
    7: { gems: 15, xp: 50, message: 'Uma semana completa! 🚀' },
    30: { gems: 100, xp: 200, message: 'Um mês incrível! 🏆' }
  }
};

module.exports = { lessons, gamificationConfig };