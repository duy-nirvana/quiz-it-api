const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quiz.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', authMiddleware, quizController.getAll);
router.get('/:id', authMiddleware, quizController.getById);
router.post('/create', authMiddleware, quizController.createQuiz);
router.put('/update', authMiddleware, quizController.updateQuiz);

module.exports = router;
