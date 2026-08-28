const ServiceCategory = require('../models/ServiceCategory');
const AppError = require('../utils/AppError');
const { paginate, paginationMeta } = require('../utils/pagination');
const generateSlug = require('../utils/slug');

class CategoryService {
  async getCategories(queryParams) {
    const { page, limit, search, sort } = queryParams;

    let filter = { isActive: true };
    if (search) {
      filter.name = new RegExp(search, 'i');
    }

    let sortObj = {};
    if (sort) {
      const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
      const sortOrder = sort.startsWith('-') ? -1 : 1;
      sortObj[sortField] = sortOrder;
    } else {
      sortObj = { name: 1 };
    }

    const total = await ServiceCategory.countDocuments(filter);
    const { query, page: currentPage, limit: currentLimit } = paginate(
      ServiceCategory.find(filter).sort(sortObj),
      page,
      limit
    );

    const categories = await query;

    return {
      categories,
      pagination: paginationMeta(total, currentPage, currentLimit)
    };
  }

  async getCategoryById(id) {
    const category = await ServiceCategory.findById(id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    return category;
  }

  async getCategoryBySlug(slug) {
    const category = await ServiceCategory.findOne({ slug, isActive: true });
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    return category;
  }

  async createCategory(categoryData) {
    const existingCategory = await ServiceCategory.findOne({ name: categoryData.name });
    if (existingCategory) {
      throw new AppError('Category with this name already exists', 400);
    }

    const category = await ServiceCategory.create({
      ...categoryData,
      slug: generateSlug(categoryData.name)
    });

    return category;
  }

  async updateCategory(id, categoryData) {
    const category = await ServiceCategory.findById(id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    if (categoryData.name && categoryData.name !== category.name) {
      categoryData.slug = generateSlug(categoryData.name);
    }

    const updatedCategory = await ServiceCategory.findByIdAndUpdate(id, categoryData, {
      new: true,
      runValidators: true
    });

    return updatedCategory;
  }

  async deleteCategory(id) {
    const category = await ServiceCategory.findById(id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    category.isActive = false;
    await category.save();

    return category;
  }

  async toggleCategoryStatus(id) {
    const category = await ServiceCategory.findById(id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    category.isActive = !category.isActive;
    await category.save();

    return category;
  }
}

module.exports = new CategoryService();
