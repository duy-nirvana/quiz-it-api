const express = require('express');
const router = express.Router();
const personalController = require('../controllers/personal.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', authMiddleware, personalController.getProfile);

module.exports = router;
