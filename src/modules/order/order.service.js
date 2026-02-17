const orderModel = require("@/modules/order/order.model");
const { HTTP_STATUS } = require("@/shared/config/constant.config");
const { imageQueue } = require("@/shared/queues/image.queue");
const { ApiError } = require("@/shared/utils/apiError.utils");

class createOrderService {
  async createOrder(data) {
    const order = await orderModel.create(data);
    return order;
  }
}

module.exports = new createOrderService();
