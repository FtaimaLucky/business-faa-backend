const { HTTP_STATUS } = require("@/shared/config/constant.config");
const { imageQueue } = require("@/shared/queues/image.queue");
const { ApiError } = require("@/shared/utils/apiError.utils");
const productModel = require("@/modules/product/product.model");

class ProductService {
  createProduct = async (data) => {
    const product = await productModel.create({
      ...data,
      image: [],
    });

    if (!product) {
      throw new ApiError("Product not created", HTTP_STATUS.BAD_REQUEST);
    }

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
        select: "-__v -updatedAt -updatedBy -createdBy -filters -description",
      })
      .select("-__v")
      .sort(sortFilter);

    if (!products.length) {
      throw new ApiError("Product not found", HTTP_STATUS.NOT_FOUND);
    }

    return products;
  };

  updateProductInfo = async (slug, data) => {
    const product = await productModel.findOneAndUpdate(
      { slug },
      { $set: data },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!product) {
      throw new ApiError("Product not found", HTTP_STATUS.NOT_FOUND);
    }

    return product;
  };

  deletedProductImage = async (slug, imageid = []) => {
    const product = await productModel.findOne({ slug });

    if (!product) {
      throw new ApiError("Product not found", HTTP_STATUS.NOT_FOUND);
    }

    imageQueue.add(
      "delete-product-image",
      {
        productId: product._id,
        images: imageid,
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

  uploadProductImage = async (slug, images) => {
    const product = await productModel.findOne({ slug });

    if (!product) {
      throw new ApiError("Product not found", HTTP_STATUS.NOT_FOUND);
    }

    imageQueue.add(
      "upload-product-image",
      {
        productId: product._id,
        images,
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

  deleteProductService = async (slug) => {
    const product = await productModel.findOne({ slug });

    if (!product) {
      throw new ApiError("Product not found", HTTP_STATUS.NOT_FOUND);
    }

    imageQueue.add(
      "delete-product",
      {
        productId: product._id,
        images: product.image,
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
