import mongoose from "mongoose";

const serviceCategorySchema = new mongoose.Schema(
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
    collection: "ServiceCategory",
  }
);

const ServiceCategory = mongoose.model(
  "ServiceCategory",
  serviceCategorySchema
);

export default ServiceCategory;