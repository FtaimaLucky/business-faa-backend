const ApiResponse = require("@/shared/utils/apiResponse.utils");
const asyncHandler = require("@/shared/utils/asyncHandeler.utils");
const { HTTP_STATUS } = require("@/shared/config/constant.config");
const { ApiError } = require("@/shared/utils/apiError.utils");
const ProductService = require("@/modules/product/product.service");
const {
  getCache,
  setCache,
  deleteCache,
  getNsVersion,
  bumpNsVersion,
  buildCacheKey,
} = require("@/shared/utils/cache.util");

class productController {
  createProduct = asyncHandler(async (req, res) => {
    const product = await ProductService.createProduct(req.validatedData);

    // cache invalidate
    await bumpNsVersion("product");

    ApiResponse.success(
      res,
      HTTP_STATUS.CREATED,
      "Product created",
      product.name,
    );
  });

  getProducts = asyncHandler(async (req, res) => {
    const {
      category,
      minPrice,
      maxPrice,
      color,
      inStock,
      outOfStock,
      rating,
      highToLow,
      lowToHigh,
      newest,
      isLimited,
      name,
      slug,
      oldest,
      isBestSelling,
    } = req.query;

    let filter = {};
    let sort = {};

    // -------- SORTING --------
    if (highToLow) sort.price = -1;
    else if (lowToHigh) sort.price = 1;

    if (newest) sort.createdAt = -1;
    else if (oldest) sort.createdAt = 1;

    // -------- FILTERING --------

    // Category
    if (category) filter.category = category;

    // Price Range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Color
    if (color) {
      const colors = Array.isArray(color) ? color : [color];
      filter.color = { $in: colors };
    }

    // Stock
    if (inStock) filter.stock = { $gt: 0 };
    if (outOfStock) filter.stock = { $eq: 0 };

    // Limited
    if (isLimited !== undefined) {
      filter.isLimited = isLimited === "true";
    }

    // Rating
    if (rating) {
      filter.rating = { $eq: Number(rating) };
    }

    // Name Search
    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    // Slug
    if (slug) {
      filter.slug = slug;
    }

    // Best Selling
    if (isBestSelling !== undefined) {
      filter.isBestSelling = isBestSelling === "true";
    }

    // -------- CACHE KEY BUILD --------
    const cachePayload = {
      filter,
      sort,
    };

    const suffix = JSON.stringify(cachePayload);
    const cacheKey = await buildCacheKey("product", suffix);

    // try cache
    const cachedProducts = await getCache(cacheKey);
    if (cachedProducts) {
      return ApiResponse.success(
        res,
        HTTP_STATUS.OK,
        "Products fetched from cache",
        cachedProducts,
      );
    }

    // db hit
    const products = await ProductService.getProducts(filter, sort);

    // set cache (ttl 5 minutes)
    await setCache(cacheKey, products, 300);

    ApiResponse.success(res, HTTP_STATUS.OK, "Products fetched", products);
  });

  updateProductInfo = asyncHandler(async (req, res) => {
    if (!req.params.slug) {
      throw new ApiError("Product slug is required", HTTP_STATUS.BAD_REQUEST);
    }

    const product = await ProductService.updateProductInfo(
      req.params.slug,
      req.body,
    );

    // cache invalidate
    await bumpNsVersion("product");

    ApiResponse.success(
      res,
      HTTP_STATUS.OK,
      "Product information updated",
      product,
    );
  });

  deleteProductImage = asyncHandler(async (req, res) => {
    if (!req.params.slug) {
      throw new ApiError("Product slug is required", HTTP_STATUS.BAD_REQUEST);
    }

    const product = await ProductService.deletedProductImage(
      req.params.slug,
      req.body.publicId,
    );

    // cache invalidate
    await bumpNsVersion("product");

    ApiResponse.success(
      res,
      HTTP_STATUS.OK,
      "Product image deleted",
      product.name,
    );
  });

  uploadProductImage = asyncHandler(async (req, res) => {
    if (!req.params.slug) {
      throw new ApiError("Product slug is required", HTTP_STATUS.BAD_REQUEST);
    }

    const product = await ProductService.uploadProductImage(
      req.params.slug,
      req.validatedData.image,
    );

    // cache invalidate
    await bumpNsVersion("product");

    ApiResponse.success(
      res,
      HTTP_STATUS.OK,
      "Product image uploaded",
      product.name,
    );
  });

  deleteProuct = asyncHandler(async (req, res) => {
    if (!req.params.slug) {
      throw new ApiError("Product slug is required", HTTP_STATUS.BAD_REQUEST);
    }

    const product = await ProductService.deleteProductService(req.params.slug);

    // cache invalidate
    await bumpNsVersion("product");

    ApiResponse.success(res, HTTP_STATUS.OK, "Product deleted", product.name);
  });
}

module.exports = new productController();
