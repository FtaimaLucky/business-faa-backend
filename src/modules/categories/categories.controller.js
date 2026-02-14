const { ApiError } = require("@/shared/utils/apiError.utils");
const ApiResponse = require("@/shared/utils/apiResponse.utils");
const asyncHandler = require("@/shared/utils/asyncHandeler.utils");
const categoryService = require("@/modules/categories/categories.service");

class CategoryController {
  createCategory = asyncHandler(async (req, res, next) => {
    const category = await categoryService.createCategory(req.body);
    ApiResponse.success(res, 200, "Category created", category);
  });
}

module.exports = new CategoryController();
