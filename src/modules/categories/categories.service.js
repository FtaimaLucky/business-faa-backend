const categoryModel = require("@/modules/categories/categories.model");
const { ApiError } = require("@/shared/utils/apiError.utils");

class categoryService {
  createCategory = async (data) => {
    const category = await categoryModel.create(data);
    if (!category) {
      throw new ApiError("Category not created", HTTP_STATUS.BAD_REQUEST);
    }
    // 2) if image file exists → enqueue
    if (localPath) {
      const job = await imageQueue.add("upload-category-image", {
        categoryId: category._id.toString(),
        localPath,
      });

      return {
        categoryId: category._id,
        jobId: job.id,
        status: "queued",
      };
    }

    // image না থাকলে normal success
    return { categoryId: category._id, status: "created" };
  };
}

module.exports = new categoryService();
