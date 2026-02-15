const express = require("express");
const _ = express.Router();
const categoryController = require("@/modules/categories/categories.controller");
const { upload } = require("@/shared/middlewares/upload.middleware");
const schemaValidate = require("@/shared/middlewares/schemaValidate.middleware");
const { validateCategory } = require("./categories.validation");
_.route("/create-category").post(
  upload.fields([{ name: "image", maxCount: 1 }]),
  validateCategory,
  categoryController.createCategory,
);
_.route("/get-category").get(categoryController.getCategory);

module.exports = _;
