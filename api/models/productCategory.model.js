import mongoose from "mongoose";

const productCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    title: {
      type: String,
      trim: true,
    },

    images: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: "ProductCategory",
  }
);

const ProductCategory = mongoose.model(
  "ProductCategory",
  productCategorySchema
);

export default ProductCategory;