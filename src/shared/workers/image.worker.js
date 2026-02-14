const { Worker } = require("bullmq");
const fs = require("fs/promises"); // promises version
const { IMAGE_QUEUE_NAME } = require("../queues/image.queue");
const { connection } = require("../config/redis.config");
const { cloudinary } = require("../config/cloudinary.config");
const categoryModel = require("@/modules/categories/categories.model");

new Worker(
  IMAGE_QUEUE_NAME,
  async (job) => {
    const { categoryId, localPath } = job.data;

    // (optional) mark processing শুরুতেই
    await categoryModel.findByIdAndUpdate(categoryId, {
      "image.status": "processing",
      "image.localPath": localPath,
      "image.tries": job.attemptsMade, // attemptsMade starts at 0
    });

    try {
      // 1) upload
      const uploaded = await cloudinary.uploader.upload(localPath, {
        folder: "categories",
        resource_type: "image",
      });

      // 2) update DB on success
      await categoryModel.findByIdAndUpdate(categoryId, {
        image: {
          url: uploaded.secure_url,
          publicId: uploaded.public_id,
          status: "uploaded",
          localPath: "", // clear (file deleted)
          tries: job.attemptsMade + 1, // real tries count
          lastError: "",
        },
      });

      // 3) cleanup temp
      await fs.unlink(localPath);

      return { categoryId, imageUrl: uploaded.secure_url };
    } catch (err) {
      // fail হলে DB update
      await categoryModel.findByIdAndUpdate(categoryId, {
        "image.status": "failed",
        "image.tries": job.attemptsMade + 1,
        "image.lastError": err?.message || "Upload failed",
        "image.localPath": localPath, // keep for debugging
      });

      // throw করলে BullMQ retry করবে (attempts/backoff অনুযায়ী)
      throw err;
    }
  },
  { connection, concurrency: 3 },
);
