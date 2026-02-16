const { HTTP_STATUS } = require("@/shared/config/constant.config");
const { imageQueue } = require("@/shared/queues/image.queue");
const { ApiError } = require("@/shared/utils/apiError.utils");
const productModel = require("@/modules/product/product.model");
const categoryModel = require("@/modules/categories/categories.model");

class ProductService {
  createProduct = async (data) => {
    // create product
    const product = await productModel.create({
      ...data,
      image: [],
    });
    if (!product) {
      throw new ApiError("Product not created", HTTP_STATUS.BAD_REQUEST);
    }

    // now call the queue and upload image on background
    imageQueue.add(
      "upload-product-image",
      {
        productId: product._id,
        images: data.image,
      },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 3000 },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    return product;
  };
}

module.exports = new ProductService();
