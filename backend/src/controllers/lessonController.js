const lessons = require('../data/lessons');

/**
 * Controlador para operações relacionadas às aulas
 */
const lessonController = {
  /**
   * Obter todas as aulas disponíveis
   */
  getAllLessons: (req, res) => {
    try {
      // Retornar apenas o resumo das aulas (sem os passos detalhados)
      const lessonSummaries = lessons.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        level: lesson.level,
        thumbnail: lesson.thumbnail,
        duration: lesson.duration,
        available: true
      }));

      res.json({
        success: true,
        data: lessonSummaries
      });
    } catch (error) {
      console.error('Error getting lessons:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao obter aulas'
      });
    }
  },

  /**
   * Obter aula por ID
   */
  getLessonById: (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'ID da aula não fornecido'
        });
      }

      // Encontrar a aula pelo ID
      const lesson = lessons.find(lesson => lesson.id === id);

      if (!lesson) {
        return res.status(404).json({
          success: false,
          error: 'Aula não encontrada'
        });
      }

      res.json({
        success: true,
        data: lesson
      });
    } catch (error) {
      console.error('Error getting lesson by ID:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao obter aula'
      });
    }
  },

  /**
   * Verificar respostas para perguntas da aula
   */
  checkAnswer: (req, res) => {
    try {
      const { lessonId, stepId, answer } = req.body;

      if (!lessonId || !stepId || answer === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Parâmetros incompletos'
        });
      }

      // Encontrar a aula
      const lesson = lessons.find(lesson => lesson.id === lessonId);

      if (!lesson) {
        return res.status(404).json({
          success: false,
          error: 'Aula não encontrada'
        });
      }

      // Encontrar o passo da aula
      const step = lesson.steps.find(step => step.id === parseInt(stepId));

      if (!step) {
        return res.status(404).json({
          success: false,
          error: 'Passo da aula não encontrado'
        });
      }

      // Verificar se o passo tem uma resposta correta definida
      if (!step.correctAnswer) {
        return res.status(400).json({
          success: false,
          error: 'Este passo não possui resposta para verificar'
        });
      }

      // Verificar a resposta
      const userAnswer = answer.toString().toLowerCase().trim();
      const correctAnswer = step.correctAnswer.toString().toLowerCase().trim();

      const isCorrect = userAnswer.includes(correctAnswer) || correctAnswer.includes(userAnswer);

      res.json({
        success: true,
        data: {
          isCorrect,
          feedback: isCorrect
            ? step.correctFeedback || 'Resposta correta!'
            : step.wrongAnswerResponse || 'Resposta incorreta. Tente novamente!'
        }
      });
    } catch (error) {
      console.error('Error checking answer:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao verificar resposta'
      });
    }
  }
};

module.exports = lessonController;
