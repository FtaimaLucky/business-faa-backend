require("module-alias/register");
const { Worker } = require("bullmq");
const fs = require("fs/promises"); // promises version
const { IMAGE_QUEUE_NAME } = require("@/shared/queues/image.queue");
const { connection } = require("@/shared/config/redis.config");
const { cloudinaryFileUpload } = require("@/shared/config/cloudinary.config");
const categoryModel = require("@/modules/categories/categories.model");
const { connectDatabase } = require("../config/db.config");

connectDatabase().then(() => {
  imageWorkerFn();
});
const imageWorkerFn = () => {
  const imageWorker = new Worker(
    IMAGE_QUEUE_NAME,
    async (job) => {
      const { categoryId, localPath } = job.data;

      // (optional) mark processing
      const category = await categoryModel.findByIdAndUpdate(categoryId, {
        "image.status": "processing",
        "image.localPath": localPath,
        "image.tries": job.attemptsMade, // attemptsMade starts at 0
      });

      try {
        // 1) upload
        const uploaded = await cloudinaryFileUpload(localPath);

        // 2) update DB on success
        await categoryModel.findByIdAndUpdate(categoryId, {
          image: {
            url: uploaded.secure_url,
            publicId: uploaded.public_id,
            status: "uploaded",
            localPath: localPath,
            tries: job.attemptsMade + 1,
            lastError: "",
          },
          seo: {
            // only update ogImage
            ...category.seo,
            ogImage: uploaded.secure_url,
          },
        });

        // 3) cleanup temp
        await fs.unlink(localPath);

        return { categoryId, imageUrl: uploaded.secure_url };
      } catch (err) {
        console.log("image upload worker error", err);
        // fail হলে DB update
        await categoryModel.findByIdAndUpdate(categoryId, {
          "image.status": "failed",
          "image.tries": job.attemptsMade + 1,
          "image.lastError": err?.message || "Upload failed",
          "image.localPath": localPath, // keep for debugging
        });

        // throw করলে BullMQ retry করবে (attempts/backoff অনুযায়ী)
        throw err;
      } finally {
        // try 3 time then remove local path file
        if (job.attemptsMade >= 3) {
          fs.unlink(localPath);
        }
      }
    },
    { connection, concurrency: 3 },
  );

  imageWorker.on("ready", () => console.log("✅ Image Worker ready"));
  imageWorker.on("active", (job) =>
    console.log("▶️ Job active:", job.id, job.name),
  );
  imageWorker.on("completed", (job) =>
    console.log("✅ Job completed:", job.id),
  );
  imageWorker.on("failed", (job, err) =>
    console.log("❌ Job failed:", job?.id, err),
  );
  imageWorker.on("error", (err) => console.log("🔥 Worker error:", err));
};
