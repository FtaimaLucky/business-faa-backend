const { ApiError } = require("@/shared/utils/apiError.utils");
const ApiResponse = require("@/shared/utils/apiResponse.utils");
const asyncHandler = require("@/shared/utils/asyncHandeler.utils");
const categoryService = require("@/modules/categories/categories.service");
const { HTTP_STATUS } = require("@/shared/config/constant.config");
const CategoryDTO = require("./categories.dto");

class CategoryController {
  createCategory = asyncHandler(async (req, res, next) => {
    const category = await categoryService.createCategory(req.validatedData);
    ApiResponse.success(res, 200, "Category created", category);
  });
  getCategory = asyncHandler(async (req, res, next) => {
    let query = {};
    if (req.query.slug) {
      query.slug = req.query.slug;
    } else {
      query = {};
    }
    const category = await categoryService.getCategories(query);
    const categoryData = Array.isArray(category)
      ? category.map((c) => new CategoryDTO(c))
      : new CategoryDTO(category);
    ApiResponse.success(res, 200, "Category fetched", categoryData);
  });
}

module.exports = new CategoryController();
