const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, index: true },
    image: { type: String, default: "" },

    price: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 },

    color: { type: String, default: null, trim: true },
    size: { type: String, default: null, trim: true },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    invoiceId: { type: String, unique: true, index: true }, // ex: INV-20260217-XXXX
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    customer: {
      fullName: { type: String, required: true, trim: true },
      phone: {
        type: String,
        required: true,
        trim: true,
        // matches +8801XXXXXXXXX (BD)
        match: [/^\+8801\d{9}$/, "Invalid phone number format"],
        index: true,
      },
      address: { type: String, required: true, trim: true },
    },

    note: { type: String, default: null, trim: true },

    paymentMethod: {
      type: String,
      default: "cod",
    },

    items: {
      type: [orderItemSchema],
      validate: [(v) => Array.isArray(v) && v.length > 0, "Items are required"],
      required: true,
    },

    totalQty: { type: Number, default: 0, min: 0 },
    subtotal: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

//  auto invoiceId + totals
orderSchema.pre("save", function () {
  // invoiceId generate once
  if (!this.invoiceId) {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
    this.invoiceId = `INV-${y}${m}${day}-${rand}`;
  }

  // totals calc
  const items = this.items || [];
  this.totalQty = items.reduce((sum, it) => sum + Number(it.qty || 0), 0);
  this.subtotal = items.reduce(
    (sum, it) => sum + Number(it.price || 0) * Number(it.qty || 0),
    0,
  );

  // normalize note
  if (typeof this.note === "string") {
    const t = this.note.trim();
    this.note = t ? t : null;
  }
});

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
