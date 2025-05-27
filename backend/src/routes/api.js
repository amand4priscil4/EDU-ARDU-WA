/**
 * Dados das aulas do Edu-Ardu
 * Estrutura de uma aula:
 * {
 *   id: string único para a aula,
 *   title: título da aula,
 *   description: descrição breve da aula,
 *   level: nível de dificuldade (iniciante, intermediário, avançado),
 *   thumbnail: caminho da imagem de capa (opcional),
 *   duration: duração estimada em minutos,
 *   steps: [
 *     {
 *       id: número único do passo na aula,
 *       type: tipo do passo (texto, pergunta, opções, comando-robô),
 *       message: texto principal do passo,
 *       image: imagem ilustrativa (opcional),
 *       waitForAnswer: booleano indicando se espera resposta,
 *       correctAnswer: resposta correta (para perguntas),
 *       wrongAnswerResponse: feedback para respostas incorretas,
 *       correctFeedback: feedback para resposta correta,
 *       options: array de opções para escolha múltipla
 *     }
 *   ]
 * }
 */

const lessons = [
  {
    id: 'robotica-basica',
    title: 'Conceitos Básicos de Robótica',
    description: 'Aprenda o que é robótica e como os robôs funcionam',
    level: 'iniciante',
    thumbnail: '/images/imagem4.jpg',
    duration: 15,
    steps: [
      {
        id: 1,
        type: 'texto',
        message:
          'Olá! Eu sou o Robo-Duino e vou te ensinar sobre robótica! 🤖 Você está pronto para nossa aventura no mundo dos robôs?',
        options: [
          {
            text: 'Sim, quero aprender!',
            response: 'Ótimo! Vamos começar nossa jornada no mundo da robótica!'
          },
          {
            text: 'O que é robótica?',
            response: 'Excelente pergunta! Vamos descobrir juntos o que é robótica.'
          }
        ]
      },
      {
        id: 2,
        type: 'texto',
        message:
          'Primeiro, vamos entender: O que é robótica? 🤔\n\nRobótica é a ciência que estuda como criar e controlar robôs! Os robôs são máquinas especiais que podemos programar para fazer tarefas, como mover objetos, explorar lugares ou até ajudar pessoas.',
        image: '/images/imagem3.jpg'
      },
      {
        id: 3,
        type: 'pergunta',
        message: 'Você já viu algum robô no seu dia a dia ou em filmes? Conte para mim!',
        waitForAnswer: true
      },
      {
        id: 4,
        type: 'texto',
        message:
          'Que legal! Existem muitos tipos de robôs:\n\n• Robôs industriais que montam carros\n• Robôs domésticos como aspiradores de pó\n• Robôs de brinquedo\n• Braços robóticos\n• Robôs que exploram outros planetas\n\nE muitos outros!'
      },
      {
        id: 5,
        type: 'texto',
        message: 'Para um robô funcionar, ele precisa de 3 partes principais. Vamos conhecê-las?',
        options: [
          {
            text: 'Sim, quero saber!',
            response: 'Ótimo! Vamos descobrir as 3 partes principais de um robô.'
          }
        ]
      },
      {
        id: 6,
        type: 'texto',
        message:
          'As 3 partes principais de um robô são:\n\n1️⃣ SENSORES: São como os "olhos e ouvidos" do robô. Eles detectam o que está acontecendo ao redor.\n\n2️⃣ CÉREBRO: É o computador que controla o robô e toma decisões baseadas nos sensores.\n\n3️⃣ ATUADORES: São os "músculos" do robô, como motores que fazem ele se movimentar.',
        image: '/images/imagem1.jpg'
      },
      {
        id: 7,
        type: 'opcoes',
        message: 'Qual destas é uma parte principal de um robô?',
        options: [
          {
            text: 'Bateria',
            isCorrect: false,
            response:
              'A bateria é importante, mas não é uma das 3 partes principais. As partes principais são: sensores, cérebro (computador) e atuadores (motores).'
          },
          {
            text: 'Sensores',
            isCorrect: true,
            response:
              'Correto! Os sensores são como os "sentidos" do robô. Eles ajudam o robô a "perceber" o mundo ao seu redor.'
          },
          {
            text: 'Rodas',
            isCorrect: false,
            response:
              'As rodas são um tipo de atuador, mas não são uma das 3 partes principais em si. As partes principais são: sensores, cérebro (computador) e atuadores (como motores).'
          }
        ]
      },
      {
        id: 8,
        type: 'texto',
        message:
          'Vamos falar sobre SENSORES! Os sensores são dispositivos que detectam mudanças no ambiente. Alguns exemplos são:',
        image: '/images/imagem4.jpg'
      },
      {
        id: 9,
        type: 'texto',
        message:
          '🔆 Sensor de luz: Detecta se está claro ou escuro\n🔊 Sensor de som: Detecta ruídos\n🌡️ Sensor de temperatura: Detecta se está quente ou frio\n📏 Sensor de distância: Detecta se algo está perto ou longe\n👆 Sensor de toque: Detecta quando algo é tocado'
      },
      {
        id: 10,
        type: 'pergunta',
        message: 'Qual sensor um robô precisaria para saber se está escuro ou claro?',
        waitForAnswer: true,
        correctAnswer: 'luz',
        wrongAnswerResponse:
          'Não é bem isso. Para detectar se está escuro ou claro, o robô precisaria de um sensor de luz.'
      },
      {
        id: 11,
        type: 'texto',
        message:
          'Excelente! O sensor de luz é perfeito para detectar se está escuro ou claro.\n\nAgora vamos falar sobre o CÉREBRO do robô!'
      },
      {
        id: 12,
        type: 'texto',
        message:
          'O cérebro do robô é um computador pequeno que é programado para controlar todas as ações do robô. Ele recebe informações dos sensores, decide o que fazer e depois comanda os atuadores para agir.',
        image: '/images/imagem3.jpg'
      },
      {
        id: 13,
        type: 'opcoes',
        message: 'Você sabe o que é programação?',
        options: [
          {
            text: 'São instruções para o computador seguir',
            isCorrect: true,
            response:
              'Perfeito! Programação é dar instruções claras e precisas para o computador seguir, como uma receita.'
          },
          {
            text: 'É quando ligamos o robô',
            isCorrect: false,
            response:
              'Na verdade, programação é mais que isso. Programação é criar instruções (código) para o computador seguir, dizendo exatamente o que ele deve fazer.'
          },
          {
            text: 'Não sei',
            isCorrect: false,
            response:
              'Programação é como criar uma lista de instruções muito precisas para o computador seguir. É como uma receita que diz exatamente o que o robô deve fazer em cada situação.'
          }
        ]
      },
      {
        id: 14,
        type: 'texto',
        message:
          'Por último, vamos falar sobre os ATUADORES! Os atuadores são os "músculos" do robô. Eles fazem o robô se mover ou interagir com o mundo. Alguns exemplos são:'
      },
      {
        id: 15,
        type: 'texto',
        message:
          '⚙️ Motores: Fazem as rodas girarem ou braços se moverem\n💡 LEDs: São luzes que podem acender e apagar\n🔊 Alto-falantes: Produzem sons\n📱 Telas: Mostram informações\n\nOs atuadores são controlados pelo cérebro do robô!',
        image: '/images/imagem5.jpg'
      },
      {
        id: 16,
        type: 'pergunta',
        message: 'Se um robô precisa se mover para frente e para trás, qual atuador ele precisa?',
        waitForAnswer: true,
        correctAnswer: 'motor',
        wrongAnswerResponse:
          'Não é bem isso. Para se mover para frente e para trás, um robô geralmente precisa de motores que fazem as rodas girarem.'
      },
      {
        id: 17,
        type: 'texto',
        message:
          'Isso mesmo! Os motores são os atuadores que permitem o movimento do robô.\n\nAgora você já conhece as 3 partes principais de um robô:'
      },
      {
        id: 18,
        type: 'texto',
        message:
          '1️⃣ SENSORES: Detectam o ambiente\n2️⃣ CÉREBRO: Toma decisões\n3️⃣ ATUADORES: Realizam ações\n\nEstas partes trabalham juntas em um ciclo que chamamos de "ciclo robótico":'
      },
      {
        id: 19,
        type: 'texto',
        message:
          'O Ciclo Robótico funciona assim:\n\n1. Os SENSORES coletam informações\n2. O CÉREBRO processa as informações\n3. O CÉREBRO decide o que fazer\n4. Os ATUADORES executam a ação\n5. E o ciclo recomeça!',
        image: '/images/lessons/ciclo-robotico.jpg'
      },
      {
        id: 20,
        type: 'texto',
        message:
          'Fantástico! Agora você já conhece os conceitos básicos de robótica!\n\nNa próxima aula, vamos conhecer o Arduino, uma plataforma incrível que nos permite criar nossos próprios robôs e projetos eletrônicos!'
      },
      {
        id: 21,
        type: 'pergunta',
        message: 'O que você achou mais interessante sobre robótica?',
        waitForAnswer: true
      },
      {
        id: 22,
        type: 'texto',
        message:
          'Legal! Obrigado por compartilhar! Agora você está pronto para avançar para a próxima etapa da nossa jornada: conhecer o Arduino!\n\nNos vemos na próxima aula! 🤖'
      }
    ]
  },
  {
    id: 'introducao-arduino',
    title: 'Introdução ao Arduino',
    description: 'Aprenda o que é um Arduino e como ele funciona',
    level: 'iniciante',
    thumbnail: '/images/imagem3.jpg',
    duration: 20,
    steps: [
      {
        id: 1,
        type: 'texto',
        message:
          'Olá novamente! Agora que você já conhece os conceitos básicos de robótica, vamos aprender sobre o Arduino! 🤖 Você está pronto?',
        options: [
          {
            text: 'Sim, estou pronto!',
            response: 'Ótimo! Vamos começar nossa jornada pelo mundo do Arduino!'
          },
          {
            text: 'O que é Arduino?',
            response: 'Boa pergunta! Vamos descobrir juntos o que é o Arduino.'
          }
        ]
      },
      {
        id: 2,
        type: 'texto',
        message:
          'Primeiro, vamos descobrir: O que é um Arduino? 🤔\n\nArduino é uma pequena placa de computador que podemos programar para fazer muitas coisas legais, como acender luzes, tocar músicas, mover robôs e muito mais!',
        image: '/images/imagem5.jpg'
      },
      {
        id: 3,
        type: 'pergunta',
        message: 'Você consegue imaginar o que podemos criar com um Arduino?',
        waitForAnswer: true
      },
      {
        id: 4,
        type: 'texto',
        message:
          'Isso mesmo! Com o Arduino podemos criar muitas coisas legais como:\n\n• Robôs que se movem\n• Jogos com luzes\n• Alarmes\n• Instrumentos musicais\n• Regadores automáticos para plantas\n\nE muitas outras invenções divertidas!'
      },
      {
        id: 5,
        type: 'texto',
        message:
          'Vamos olhar como é um Arduino? Esta é a placa Arduino UNO, a mais comum para iniciantes:',
        image: '/images/imagem4.jpg'
      },
      {
        id: 6,
        type: 'opcoes',
        message:
          'O Arduino tem várias partes importantes. Vamos ver se você consegue identificar uma delas. Qual destas é uma parte do Arduino?',
        options: [
          {
            text: 'Pinos digitais',
            isCorrect: true,
            response:
              'Correto! Os pinos digitais são onde conectamos componentes como LEDs, botões e sensores.'
          },
          {
            text: 'Tela de toque',
            isCorrect: false,
            response:
              'Na verdade, o Arduino básico não tem tela de toque. Ele tem pinos digitais onde conectamos componentes.'
          },
          {
            text: 'Alto-falante',
            isCorrect: false,
            response:
              'Na verdade, o Arduino básico não tem alto-falante embutido. Podemos conectar um usando os pinos digitais.'
          }
        ]
      },
      {
        id: 7,
        type: 'texto',
        message:
          'O Arduino funciona com um programa que nós escrevemos e enviamos para ele. Esses programas são chamados de "sketches" e dizem ao Arduino exatamente o que ele deve fazer.'
      },
      {
        id: 8,
        type: 'texto',
        message:
          'Vamos ver um exemplo simples de um programa para o Arduino que faz um LED piscar:',
        image: '/images/lessons/codigo-led.jpg'
      },
      {
        id: 9,
        type: 'texto',
        message:
          'Este programa faz o Arduino acender e apagar um LED a cada segundo. Vamos tentar entender o código?\n\nA função "setup()" roda uma vez quando o Arduino liga, e a função "loop()" fica rodando repetidamente depois disso.'
      },
      {
        id: 10,
        type: 'pergunta',
        message: 'Para que serve a função loop() no Arduino?',
        waitForAnswer: true,
        correctAnswer: 'repetir',
        wrongAnswerResponse:
          'Hmm, não é bem isso. A função loop() serve para fazer o código repetir continuamente, executando as mesmas instruções várias vezes enquanto o Arduino estiver ligado.'
      },
      {
        id: 11,
        type: 'texto',
        message:
          'Muito bem! A função loop() no Arduino é usada para repetir código continuamente, como um ciclo sem fim.\n\nAgora, vamos montar nosso primeiro circuito com LED!',
        image: '/images/lessons/circuito-led.jpg'
      },
      {
        id: 12,
        type: 'texto',
        message:
          'Para montar este circuito, precisamos de:\n\n• 1 Arduino UNO\n• 1 LED (qualquer cor)\n• 1 Resistor de 220 ohms\n• Fios de conexão\n• 1 Protoboard (aquela placa branca com furinhos)'
      },
      {
        id: 13,
        type: 'opcoes',
        message: 'Qual é a função do resistor neste circuito com LED?',
        options: [
          {
            text: 'Fazer o LED brilhar mais forte',
            isCorrect: false,
            response:
              'Na verdade, o resistor faz o contrário! Ele limita a corrente para proteger o LED.'
          },
          {
            text: 'Limitar a corrente para proteger o LED',
            isCorrect: true,
            response:
              'Exatamente! O resistor limita a quantidade de corrente elétrica que passa pelo LED, protegendo-o de queimar.'
          },
          {
            text: 'Apenas decoração',
            isCorrect: false,
            response:
              'O resistor não é decoração! Ele tem uma função importante: limitar a corrente para proteger o LED de queimar.'
          }
        ]
      },
      {
        id: 14,
        type: 'texto',
        message:
          'Parabéns! Você aprendeu os conceitos básicos do Arduino hoje:\n\n1. O que é um Arduino\n2. Para que ele serve\n3. Como funciona um programa básico\n4. Como montar um circuito simples com LED'
      },
      {
        id: 15,
        type: 'comando-robo',
        message:
          'Vamos ver se conseguimos fazer o robô acender um LED! Clique no botão abaixo para tentar:',
        robotCommand: 'LED_ON'
      },
      {
        id: 16,
        type: 'pergunta',
        message: 'Você gostou de aprender sobre Arduino? O que você achou mais interessante?',
        waitForAnswer: true
      },
      {
        id: 17,
        type: 'texto',
        message:
          'Obrigado por compartilhar! Na próxima aula, vamos aprender a fazer mais projetos legais com o Arduino, como um semáforo com luzes coloridas e um sensor de luz!\n\nAté a próxima aventura com o Robo-Duino! 🤖'
      }
    ]
  },
  {
    id: 'projetos-led',
    title: 'Criando com LEDs',
    description: 'Aprenda a fazer projetos divertidos com LEDs',
    level: 'iniciante',
    thumbnail: '/images/imagem2.jpg',
    duration: 25,
    steps: [
      // Conteúdo a ser adicionado no futuro
    ]
  },
  {
    id: 'sensores-arduino',
    title: 'Sensores Divertidos',
    description: 'Aprenda a usar sensores com o Arduino',
    level: 'intermediário',
    thumbnail: '/images/imagem1.jpg',
    duration: 30,
    steps: [
      // Conteúdo a ser adicionado no futuro
    ]
  }
];

module.exports = lessons;
