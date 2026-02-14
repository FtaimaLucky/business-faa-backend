const express = require("express");
const _ = express.Router();
_.use("/categories", require("@/modules/categories/categories.routes"));

module.exports = _;
