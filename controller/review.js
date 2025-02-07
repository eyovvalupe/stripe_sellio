import path from "path";
import Review from "../models/review.js";
import Listing from "../models/listing.js"
import ErrorHandler from "../utils/ErrorHandler.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";

const create = async (req, res) => {
  const {_id , profileImage , fullName } = req.user;
  const {comment,rating ,listingId} =req.body;
  try{
    const listing = await Listing.findById(listingId);
    const review = await Review.create({
      buyerName:fullName,
      comment,
      rating,
      buyerId: _id,
      buyerAvatar:profileImage
    });
    listing.reviews.push(review);
    await listing.save();

    res.status(201).json({
      success:true,
      message:"Review created successfully"
    })
  }catch(e){
    console.log(e);
    res.status(e.statusCode || 500).json(e.message || "an  unexpected error occured");
    
  }
};

export default {
  create,
};
