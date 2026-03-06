const { ApiError } = require("@/shared/utils/apiError.utils");
const ApiResponse = require("@/shared/utils/apiResponse.utils");
const asyncHandler = require("@/shared/utils/asyncHandeler.utils");
const categoryService = require("@/modules/categories/categories.service");
const { HTTP_STATUS } = require("@/shared/config/constant.config");
const CategoryDTO = require("./categories.dto");
const {
  getCache,
  setCache,
  bumpNsVersion,
  buildCacheKey,
} = require("@/shared/utils/cache.util");

class CategoryController {
  createCategory = asyncHandler(async (req, res, next) => {
    const category = await categoryService.createCategory(req.validatedData);

    // invalidate category cache
    await bumpNsVersion("category");

    ApiResponse.success(res, 200, "Category created", category);
  });

  getCategory = asyncHandler(async (req, res, next) => {
    let query = {};

    if (req.query.slug) {
      query.slug = req.query.slug;
    }

    const suffix = JSON.stringify({ query });
    const cacheKey = await buildCacheKey("category", suffix);

    const cachedCategory = await getCache(cacheKey);
    if (cachedCategory) {
      return ApiResponse.success(
        res,
        200,
        "Category fetched from cache",
        cachedCategory,
      );
    }

    const category = await categoryService.getCategories(query);

    const categoryData = Array.isArray(category)
      ? category.map((c) => new CategoryDTO(c))
      : new CategoryDTO(category);

    await setCache(cacheKey, categoryData, 300);

    ApiResponse.success(res, 200, "Category fetched", categoryData);
  });

  updateCategory = asyncHandler(async (req, res, next) => {
    if (!req.params.slug) {
      throw new ApiError("Category slug is required", HTTP_STATUS.BAD_REQUEST);
    }

    const category = await categoryService.updateCategory(
      req.params.slug,
      req.validatedData,
    );

    // invalidate category cache
    await bumpNsVersion("category");

    ApiResponse.success(res, 200, "Category updated", category);
  });

  deleteCategory = asyncHandler(async (req, res, next) => {
    if (!req.params.slug) {
      throw new ApiError("Category slug is required", HTTP_STATUS.BAD_REQUEST);
    }

    const category = await categoryService.deleteCategory(req.params.slug);

    // invalidate category cache
    await bumpNsVersion("category");

    ApiResponse.success(res, 200, "Category deleted", category);
  });
}

module.exports = new CategoryController();
