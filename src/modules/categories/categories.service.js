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
  updateCategory = async (slug, data) => {
    const files = data?.image || [];
    const firstImage = Array.isArray(files) ? files[0] : null;
    const { image, ...rest } = data;
    // find the category using slug
    const category = await categoryModel.findOne({ slug });
    if (!category)
      throw new ApiError("Category not found", HTTP_STATUS.NOT_FOUND);
    const oldPublicId = category.image?.publicId || "";
    // normal fields update
    const updatePayload = {
      ...rest,
      updatedAt: Date.now(),
    };
    // if file have
    if (firstImage?.path) {
      updatePayload.image = {
        status: "pending",
        localPath: firstImage.path,
        url: "",
        publicId: oldPublicId, // temporarily keep
        tries: 0,
        lastError: "",
      };
    }

    const updated = await categoryModel.findByIdAndUpdate(
      category._id,
      { $set: updatePayload },
      { new: true },
    );

    // enqueue if image exists
    if (firstImage?.path) {
      const job = await imageQueue.add(
        "update-category-image",
        {
          categoryId: category._id.toString(),
          localPath: firstImage.path,
          oldPublicId,
        },
        {
          attempts: 3,
          backoff: { type: "exponential", delay: 3000 },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );

      return { categoryId: category._id, jobId: job.id, status: "queued" };
    }
    return updated;
  };
}

module.exports = new categoryService();
