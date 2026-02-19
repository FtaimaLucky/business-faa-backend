const express = require("express");
const _ = express.Router();
const contactController = require("@/modules/contactMessage/contact.controller");

_.route("/create-contact").post(contactController.createContact);
_.route("/get-contacts").get(contactController.getContact);
_.route("/delete-contact/:phoneNumber").delete(contactController.deleteContact);

module.exports = _;
