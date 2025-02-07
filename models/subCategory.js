import { Schema, model } from "mongoose";

const subCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your subcategory name"],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "SubCategory must belong to a Category"],
    },
  },
  { timestamps: true, versionKey: false }
);

export default model("SubCategory", subCategorySchema);
