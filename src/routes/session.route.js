const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/session.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// router.get('/', authMiddleware, quizController.getAll);
router.get('/:id', sessionController.getById);
router.post('/create', authMiddleware, sessionController.createSession);
router.get('/complete/:id', authMiddleware, sessionController.completeSession);

module.exports = router;
