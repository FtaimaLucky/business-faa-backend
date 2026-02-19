const express = require("express");
const _ = express.Router();
const contactController = require("@/modules/contactMessage/contact.controller");

_.route("/create-contact").post(contactController.createContact);

module.exports = _;
