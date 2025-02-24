const express = require('express');
const router = express.Router();
const resultController = require('../controllers/result.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/:id', resultController.getById);
router.post('/create', authMiddleware, resultController.createResult);

module.exports = router;
