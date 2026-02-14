const categoryModel = require("@/modules/categories/categories.model");
const { ApiError } = require("@/shared/utils/apiError.utils");

class categoryService {
  createCategory = async (data) => {
    const category = await categoryModel.create(data);
    if (!category) {
      throw new ApiError("Category not created", HTTP_STATUS.BAD_REQUEST);
    }
    return category;
  };
}

module.exports = new categoryService();
