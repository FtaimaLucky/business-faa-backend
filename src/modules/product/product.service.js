const { HTTP_STATUS } = require("@/shared/config/constant.config");
const { imageQueue } = require("@/shared/queues/image.queue");
const { ApiError } = require("@/shared/utils/apiError.utils");
const productModel = require("@/modules/product/product.model");

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

  getProducts = async (filter, sortFilter) => {
    const products = await productModel
      .find(filter)
      .populate({
        path: "category",
        select:
          "-_id  -__v -updatedAt -updatedBy  -createdBy -filters -description",
      })
      .select("-_id -__v ")
      .sort(sortFilter);
    if (!products.length) {
      throw new ApiError("Product not found", HTTP_STATUS.NOT_FOUND);
    }
    return products;
  };
  updateProductInfo = async (slug, data) => {
    const product = await productModel.findOneAndUpdate({ slug }, data, {
      returnDocument: "after",
    });
    if (!product) {
      throw new ApiError("Product not found", HTTP_STATUS.NOT_FOUND);
    }
    return product;
  };
}

module.exports = new ProductService();
