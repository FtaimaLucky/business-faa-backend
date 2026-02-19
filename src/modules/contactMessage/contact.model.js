const mongoose = require("mongoose");
const { validate } = require("./contact.validation");

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      validate: [
        (v) => /^(?:\+88|01)\d{11}$/.test(v) || /^01\d{9}$/.test(v),
        "Phone must be in format +8801XXXXXXXXX or 01XXXXXXXXX (Bangladesh).",
      ],
    },
    message: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Contact", contactSchema);
