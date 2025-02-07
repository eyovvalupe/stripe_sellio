import { Schema, model } from "mongoose";
import {reviewSchema } from "./review.js";
const listingSchema = new Schema(
  {
    businessTitle: {
      type: String,
      required: [true, "Please enter a title for the listing"],
    },
    serviceTitle: {
      type: String,
      required: [true, "Please enter a title for the listing"],
    },
    businessInfo:{
      type: String,
      required: [true, "Please enter a description for the listing"],
    },
    serviceDescription: {
      type: String,
      required: [true, "Please enter a description for the listing"],
    },
    serviceCategory: {
      type: String,
      required: [true, "Please enter the listing category"],
    },
    serviceSubCategory: {
      type: String,
      required: [true, "Please enter the listing Sub Category"],
    },
    serviceImages: [
      {
        type: String,
        required: [true, "Please provide at least one image"],
      },
    ],
    logo: 
      {
        type: String,
        required:[true,"Please Provide Your Business Logo"]
      },
    website: 
      {
        type: String
      },
    location:{
      type:String,
      required:true
    },
    services: [
      {
        type: String,
        required: [true, "Please provide at least one service"],
      },
    ],
    plan: {
      type:Schema.Types.ObjectId,
      ref:"Plan",
      required:[true,"Plan ID is required"]
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Seller ID is required"],
    },
    reviews:[
      {
        type: Schema.Types.ObjectId,
        ref:"Review"
      }
    ]
  },
  { timestamps: true, versionKey: false }
);

export default model("Listing", listingSchema);
