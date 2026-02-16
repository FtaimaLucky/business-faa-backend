const { upload } = require("@/shared/middlewares/upload.middleware");
const productController = require("@/modules/product/product.controller");
const express = require("express");
const {
  validateProduct,
  validateUpdateProduct,
} = require("./product.validation");
const _ = express.Router();
_.route("/create-product").post(
  upload.fields([{ name: "image", maxCount: 10 }]),
  validateProduct,
  productController.createProduct,
);
_.route("/get-products").get(productController.getProducts);
_.route("/update-productinfo/:slug").put(
  validateUpdateProduct,
  productController.updateProductInfo,
);

module.exports = _;
