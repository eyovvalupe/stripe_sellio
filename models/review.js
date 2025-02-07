import { Schema, model } from "mongoose";

export const reviewSchema = new Schema(
  {
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Buyer ID is required"],
    },
    buyerAvatar:{
      type:String,
      required: [true,"Buyer Avatar is required"]
    },
    buyerName:{
      type:String,
      required:[true,"Buyer Name is required"]
    },
    rating: {
      type: Number,
      enum: {
        values:[1,2,3,4,5],
        message:"Rating should be between 1 to 5"
      },
      default: 5,
      required: [true, "Rating is required"],
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
    },
  },
  { timestamps: true, versionKey: false }
);

 const Review = model("Review", reviewSchema);

 export default Review;
