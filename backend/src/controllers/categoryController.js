const categoryService = require('../services/categoryService');
const { sendResponse } = require('../utils/response');

exports.getCategories = async (req, res, next) => {
  try {
    const result = await categoryService.getCategories(req.query);
    sendResponse(res, 200, true, 'Categories retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

exports.getCategoryById = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    sendResponse(res, 200, true, 'Category retrieved successfully', category);
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body);
    sendResponse(res, 201, true, 'Category created successfully', category);
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    sendResponse(res, 200, true, 'Category updated successfully', category);
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    await categoryService.deleteCategory(req.params.id);
    sendResponse(res, 200, true, 'Category deleted successfully');
  } catch (error) {
    next(error);
  }
};

exports.toggleCategoryStatus = async (req, res, next) => {
  try {
    const category = await categoryService.toggleCategoryStatus(req.params.id);
    sendResponse(res, 200, true, 'Category status updated successfully', category);
  } catch (error) {
    next(error);
  }
};
