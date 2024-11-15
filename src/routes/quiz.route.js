const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quiz.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', authMiddleware, quizController.getAll);
router.post('/', authMiddleware, quizController.createQuiz);

module.exports = router;
