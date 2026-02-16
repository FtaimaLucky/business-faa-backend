const slugify = require("slugify");
const { HTTP_STATUS } = require("@/shared/config/constant.config");
const { ApiError } = require("@/shared/utils/apiError.utils");
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true, index: true },

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

    filters: [{ type: String }],
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

// slug from name
categorySchema.pre("save", function () {
  if (!this.isModified("name")) return;
  this.slug = slugify(this.name, { lower: true, strict: true });
});

//  duplicate slug check (async middleware, no next)
categorySchema.pre("save", async function () {
  if (!this.isModified("name")) return;

  const duplicate = await this.constructor.findOne({
    slug: this.slug,
    _id: { $ne: this._id }, // update case safe
  });

  if (duplicate) {
    throw new ApiError("Category name already exist", HTTP_STATUS.BAD_REQUEST);
  }
});

// seo metadata
categorySchema.pre("save", function () {
  if (
    !this.isModified("name") &&
    !this.isModified("description") &&
    !this.isModified("image.url")
  )
    return;

  this.seo.metaTitle = this.name;
  this.seo.metaDescription = this.description;
  this.seo.ogImage = this.image?.url || "";
});

categorySchema.pre("findOneAndUpdate", function () {
  const update = this.getUpdate();
  if (!update) return;

  // normalize $set
  const $set = update.$set || {};

  // -------- name changed -> slug + seo.metaTitle
  if (update.name !== undefined || $set.name !== undefined) {
    const name = (update.name ?? $set.name) || "";
    const slug = name ? slugify(name, { lower: true, strict: true }) : "";

    // slug set (same style you are using)
    if (update.name !== undefined) update.slug = slug;
    else $set.slug = slug;

    // only metaTitle update (others untouched)
    $set["seo.metaTitle"] = name;
  }

  // -------- description changed -> seo.metaDescription
  if (update.description !== undefined || $set.description !== undefined) {
    const desc = (update.description ?? $set.description) || "";
    $set["seo.metaDescription"] = desc;
  }

  // -------- image url changed -> seo.ogImage
  const imgUrlChanged =
    update?.image?.url !== undefined ||
    $set?.image?.url !== undefined ||
    $set["image.url"] !== undefined ||
    update["image.url"] !== undefined;

  if (imgUrlChanged) {
    const imgUrl =
      update?.image?.url ??
      $set?.image?.url ??
      $set["image.url"] ??
      update["image.url"] ??
      "";

    $set["seo.ogImage"] = imgUrl;
  }

  // re-attach $set & apply update
  update.$set = $set;
  this.setUpdate(update);
});

module.exports =
  mongoose.models.Category || mongoose.model("Category", categorySchema);
