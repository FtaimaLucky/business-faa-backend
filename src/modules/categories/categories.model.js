const slugify = require("slugify");
const { HTTP_STATUS } = require("@/shared/config/constant.config");
const { ApiError } = require("@/shared/utils/apiError.utils");
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    image: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
      status: {
        type: String,
        enum: ["pending", "processing", "uploaded", "failed"],
        default: "pending",
      },
      localPath: { type: String, default: "" },
      tries: { type: Number, default: 0 },
      lastError: { type: String, default: "" },
    },

    description: { type: String, default: "" },

    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    isActive: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },

    seo: {
      metaTitle: { type: String, default: "" },
      metaDescription: { type: String, default: "" },
      keywords: [{ type: String }],
      ogImage: { type: String, default: "" },
    },

    filters: [{ type: String }], // e.g. ["material","color","brand"]

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

// make a slug from name
categorySchema.pre("save", function (next) {
  if (!this.isModified("name")) return next();
  this.slug = slugify(this.name);
  next();
});

// check if slug already exist or not
categorySchema.pre("save", async function (next) {
  try {
    if (!this.isModified("name")) return next();
    const duplicate = await this.constructor.findOne({ slug: this.slug });
    if (duplicate) {
      return next(
        new ApiError("Category name already exist", HTTP_STATUS.BAD_REQUEST),
      );
    }
    next();
  } catch (error) {
    next(new ApiError(error.message, HTTP_STATUS.BAD_REQUEST));
  }
});

// set seo metadata from name
categorySchema.pre("save", function (next) {
  if (!this.isModified("name")) return next();
  this.seo.metaTitle = this.name;
  this.seo.metaDescription = this.description;
  this.seo.ogImage = this.image.url;
  next();
});

module.exports =
  mongoose.models.Category || mongoose.model("Category", categorySchema);
