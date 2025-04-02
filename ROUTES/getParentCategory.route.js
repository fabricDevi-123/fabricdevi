const express = require('express');
const { parentsCategoryController } = require('../CONTROLLER');

const router = express.Router();

router.get('/:category/:subCategory?', parentsCategoryController.getCategoryData);

module.exports = router;
