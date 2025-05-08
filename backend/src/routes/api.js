const express = require('express');
const router = express.Router();
const robotController = require('../controllers/robotController');
const lessonController = require('../controllers/lessonController');

// Rotas para o robô
router.get('/robot/status', robotController.getStatus);
router.post('/robot/command', robotController.sendCommand);
router.post('/robot/message', robotController.sendMessage);
router.post('/robot/connect', robotController.connect);
router.post('/robot/disconnect', robotController.disconnect);
router.get('/robot/ports', robotController.listPorts);
router.post('/robot/simulation', robotController.enableSimulation);
router.post('/robot/upload-code', robotController.uploadCode);

// Rotas para aulas
router.get('/lessons', lessonController.getAllLessons);
router.get('/lessons/:id', lessonController.getLessonById);

module.exports = router;
