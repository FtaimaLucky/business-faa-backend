const express = require("express");
const _ = express.Router();
const orderController = require("@/modules/order/order.controller");
const { validateCreateOrder } = require("./order.validation");

_.route("/create-order").post(validateCreateOrder, orderController.createOrder);
_.route("/get-orders").get(orderController.getOrders);
_.route("/delete-order/:invoiceId").delete(orderController.deleteOrder);

module.exports = _;
