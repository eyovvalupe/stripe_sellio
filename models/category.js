import { Schema, model } from "mongoose";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your category name"],
    },
    subCategories: [
      {
        type: Schema.Types.ObjectId,
        ref: "SubCategory",
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

export default model("Category", categorySchema);
