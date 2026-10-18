import mongoose from "mongoose";

const productSubCategorySchema = new mongoose.Schema(
  {
    productCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductCategory",
      required: true,
    },

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
    collection: "ProductSubCategory",
  }
);

const ProductSubCategory = mongoose.model(
  "ProductSubCategory",
  productSubCategorySchema
);

export default ProductSubCategory;