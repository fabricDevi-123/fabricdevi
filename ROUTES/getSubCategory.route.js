const express = require('express');
const { subCategoryController } = require('../CONTROLLER');
const router = express.Router();

router.get('/:category/subcategories', subCategoryController.getAllSubCategory);

module.exports = router;
