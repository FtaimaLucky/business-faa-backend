const express = require("express");
const _ = express.Router();
const categoryController = require("@/modules/categories/categories.controller");
const { upload } = require("@/shared/middlewares/upload.middleware");

const {
  validateCategory,
  validateUpdateCategory,
} = require("./categories.validation");
_.route("/create-category").post(
  upload.fields([{ name: "image", maxCount: 1 }]),
  validateCategory,
  categoryController.createCategory,
);
_.route("/get-category").get(categoryController.getCategory);
_.route("/update-category/:slug").put(
  upload.fields([{ name: "image", maxCount: 1 }]),
  validateUpdateCategory,
  categoryController.updateCategory,
);

module.exports = _;
