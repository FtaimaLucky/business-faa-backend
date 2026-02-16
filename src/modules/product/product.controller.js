const { ApiError } = require("@/shared/utils/apiError.utils");
const ApiResponse = require("@/shared/utils/apiResponse.utils");
const asyncHandler = require("@/shared/utils/asyncHandeler.utils");
const { HTTP_STATUS } = require("@/shared/config/constant.config");
const ProductService = require("@/modules/product/product.service");

class productController {
  createProduct = asyncHandler(async (req, res) => {
    const product = await ProductService.createProduct(req.validatedData);
    ApiResponse.success(res, 200, "Product created", product);
  });
}

module.exports = new productController();
