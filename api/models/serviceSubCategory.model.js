import mongoose from "mongoose";

const serviceSubCategorySchema = new mongoose.Schema(
  {
    serviceCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceCategory",
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
    collection: "ServiceSubCategory",
  }
);

const ServiceSubCategory = mongoose.model(
  "ServiceSubCategory",
  serviceSubCategorySchema
);

export default ServiceSubCategory;