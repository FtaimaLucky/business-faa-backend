const { ApiError } = require("@/shared/utils/apiError.utils");
const ApiResponse = require("@/shared/utils/apiResponse.utils");
const asyncHandler = require("@/shared/utils/asyncHandeler.utils");
const orderService = require("@/modules/order/order.service");
const { HTTP_STATUS } = require("@/shared/config/constant.config");

class orderController {
  createOrder = asyncHandler(async (req, res) => {
    const order = await orderService.createOrder(req.body);
    ApiResponse.success(res, HTTP_STATUS.CREATED, "Order created", order);
  });
}

module.exports = new orderController();
