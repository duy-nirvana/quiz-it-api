const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collection.controller');

router.get('/', collectionController.getAllCollections);
router.post('/', collectionController.createCollection);

module.exports = router;