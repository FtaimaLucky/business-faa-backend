class CategoryDTO {
  constructor(category) {
    this.name = category.name;
    this.slug = category.slug;
    this.description = category.description;

    this.image = {
      url: category.image?.url || "",
      publicId: category.image?.publicId || "",
      status: category.image?.status || "pending",
      lastError: category.image?.lastError || "",
    };

    this.seo = category.seo;
    this.isActive = category.isActive;
    this.featured = category.featured;
    this.sortOrder = category.sortOrder;
    this.filters = category.filters || [];
    this.createdAt = category.createdAt;
    this.updatedAt = category.updatedAt;
  }
}

module.exports = CategoryDTO;
