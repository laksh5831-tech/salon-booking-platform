const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createCategorySchema, updateCategorySchema } = require('../validators/category');

router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);

router.post(
  '/',
  protect,
  authorize('admin'),
  validate(createCategorySchema),
  categoryController.createCategory
);

router.patch(
  '/:id',
  protect,
  authorize('admin'),
  validate(updateCategorySchema),
  categoryController.updateCategory
);

router.patch(
  '/:id/toggle-status',
  protect,
  authorize('admin'),
  categoryController.toggleCategoryStatus
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  categoryController.deleteCategory
);

module.exports = router;
