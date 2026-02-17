const express = require("express");
const _ = express.Router();
_.use("/categories", require("@/modules/categories/categories.routes"));
_.use("/product", require("@/modules/product/product.routes"));
_.use("/order", require("@/modules/order/order.route"));

module.exports = _;
