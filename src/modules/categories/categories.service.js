const categoryModel = require("@/modules/categories/categories.model");
const { imageQueue } = require("@/shared/queues/image.queue");
const { ApiError } = require("@/shared/utils/apiError.utils");

class categoryService {
  createCategory = async (data) => {
    const files = data?.image || [];
    const firstImage = Array.isArray(files) ? files[0] : null;

    // 1) Prepare category payload
    const payload = {
      ...data,
      name: data.name,
      description: data.description || "",
      featured: data.featured ?? false,
      createdBy: data.createdBy || null,
      updatedBy: data.updatedBy || null,

      image: {
        status: firstImage ? "pending" : "pending",
        localPath: firstImage?.path || "",
        url: "",
        publicId: "",
        tries: 0,
        lastError: "",
      },
    };

    //  Create category in DB
    const category = await categoryModel.create(payload);
    if (!category) {
      throw new ApiError("Category not created", HTTP_STATUS.BAD_REQUEST);
    }

    //  Enqueue image upload job (BullMQ)
    if (firstImage?.path) {
      const job = await imageQueue.add(
        "upload-category-image",
        {
          categoryId: category._id.toString(),
          localPath: firstImage.path,
        },
        {
          attempts: 3, // retry
          backoff: { type: "exponential", delay: 3000 },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );

      return {
        categoryId: category.name,
        jobId: job.id,
        status: "queued",
      };
    }
  };
  getCategories = async (query) => {
    const categories = await categoryModel.find(query);
    return categories;
  };
}

module.exports = new categoryService();
