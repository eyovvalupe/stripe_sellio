import path from "path";
import Listing from "../models/listing.js";
import User from "../models/user.js";
import Plan from "../models/plan.model.js";
import Credit from "../models/creditCard.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import Stripe from "stripe";
import mongoose from "mongoose";
import dotenv from "dotenv";
import lodash from "lodash";
dotenv.config();
const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY}`);

const create = async (req, res) => {
  const serviceImages = req.files["serviceImages"];
  const logo = req.files["logo"][0];
  if (!serviceImages || serviceImages.length === 0) {
    return res
      .status(400)
      .json({ message: "Please upload at least one image" });
  }
  if (!logo || logo.length === 0) {
    return res
      .status(400)
      .json({ message: "Please upload your business logo" });
  }
  const imageUrls = serviceImages.map((file) => path.join(file.filename));
  const logoUrl = path.join(logo.filename);
  try {
    const {
      businessTitle,
      businessInfo,
      businessWebsite,
      serviceDescription,
      servicePlan,
      serviceTitle,
      serviceCategory,
      serviceSubCategory,
      services,
      location,
      paymentId,
    } = req.body;
    const credit = await Credit.findById(paymentId);
    const plan = await Plan.findById(servicePlan);
    console.log("credit", credit, plan.planPrice);

    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount: plan.planPrice * 100,
        currency: "nzd",
        payment_method: credit.paymentId,
        customer: credit.customerId,
        confirm: true,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: "never",
        },
      });
    } catch (err) {
      console.log("Payment error:", err);
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!paymentIntent || paymentIntent.status !== "succeeded") {
      return res
        .status(400)
        .json({ success: false, message: "Payment not completed" });
    }

    if (paymentIntent.status === "succeeded") {
      const createdList = await Listing.create({
        businessTitle,
        serviceTitle,
        businessInfo,
        serviceDescription,
        serviceCategory, //foundCategory.id
        serviceSubCategory,
        serviceImages: imageUrls,
        logo: logoUrl,
        services,
        plan: servicePlan,
        location,
        website: businessWebsite,
        sellerId: req.user?.id,
      });
      res.status(201).json({
        success: true,
        message: "Payment Successful and Listing is Created",
        createdList,
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Payment not completed" });
    }
  } catch (e) {
    res
      .status(e.statusCode || 500)
      .json(e.message || "an  unexpected error occured");
  }
};

/* const findAll = catchAsyncErrors(async (req, res, next) => {

  const page = parseInt(req.query.page) || 1;  // Default to page 1 if not provided
  const limit = parseInt(req.query.limit) || 10;
  try {
    const Listings = await Listing.find().populate("plan");
    const planOrder ={
      featured:1,
      premium:2,
      basic:3
    };

    const sortedListings = Listings.sort((a,b)=>{
      return planOrder[a.plan.planType] - planOrder[b.plan.planType];
    });

    // Paginate the sorted data
    const skip = (page - 1) * limit;
    const paginatedListings = sortedListings.slice(skip, skip + limit);
    // Get total count for pagination info
    const totalListings = sortedListings.length;
    res.status(200).json({
      success: true,
      totalListings,  // Total number of listings
      totalPages: Math.ceil(totalListings / limit),  // Total pages based on the limit
      currentPage: page,  // Current page number
      listings: paginatedListings  // Paginated listings for the current page
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
}); */

const findAll = catchAsyncErrors(async (req, res, next) => {
  try {
    // Get page number and limit from query parameters (defaults if not provided)
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page if not provided
    const { category, title, subCategory, country, region, district } =
      req.query;

    const query = {};
    if (category) {
      query.serviceCategory = lodash.lowerCase(category);
    }
    if (country || region || district) {
      query.location = {
        $regex: `(${[country, region, district].filter(Boolean).join("|")})`,
        $options: "i",
      };
    }
    if (subCategory) {
      query.serviceSubCategory = lodash.lowerCase(subCategory);
    }
    if (title) {
      query.serviceTitle = {
        $regex: `^${lodash.lowerCase(title)}`,
        $options: "i",
      };
    }
    // MongoDB aggregation pipeline to sort and paginate the listings
    const listings = await Listing.aggregate([
      {
        $match: category ? { serviceCategory: category } : {},
      },
      {
        $match: {
          ...(country
            ? { location: { $regex: `\\b${country}\\b`, $options: "i" } }
            : {}),
          ...(region
            ? { location: { $regex: `\\b${region}\\b`, $options: "i" } }
            : {}),
          ...(district
            ? { location: { $regex: `\\b${district}\\b`, $options: "i" } }
            : {}),
        },
      },
      {
        $match: subCategory ? { serviceSubCategory: subCategory } : {},
      },
      {
        $match: title
          ? { serviceTitle: { $regex: `^${title}`, $options: "i" } }
          : {},
      },
      {
        $lookup: {
          from: "plans", // Replace with the actual collection name if needed
          localField: "plan", // Field to match from Listing
          foreignField: "_id", // Field to match from Plan
          as: "plan", // Alias for the populated field
        },
      },
      { $unwind: "$plan" }, // Unwind the plan array to flatten it
      {
        $lookup: {
          from: "reviews",
          localField: "reviews",
          foreignField: "_id",
          as: "reviews",
        },
      },
      { $unwind: { path: "$review", preserveNullAndEmptyArrays: true } },
      // Sort the listings by planType
      {
        $addFields: {
          planOrder: {
            $switch: {
              branches: [
                { case: { $eq: ["$plan.planType", "featured"] }, then: 1 },
                { case: { $eq: ["$plan.planType", "premium"] }, then: 2 },
                { case: { $eq: ["$plan.planType", "basic"] }, then: 3 },
              ],
              default: 4, // Default to 4 if not matched
            },
          },
        },
      },
      { $sort: { planOrder: 1 } }, // Sort by the computed planOrder

      // Pagination
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]);

    // Get the total number of listings for pagination info
    const totalListings = await Listing.countDocuments(query);

    res.status(200).json({
      success: true,
      totalListings, // Total number of listings
      totalPages: Math.ceil(totalListings / limit), // Total pages based on the limit
      currentPage: page, // Current page number
      listings, // Paginated and sorted listings
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

const findUser = async (req, res) => {
  // Get page number and limit from query parameters (defaults if not provided)
  const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
  const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page if not provided
  const skip = (page - 1) * limit;
  const { _id } = req.user;
  try {
    const userListings = await Listing.find({ sellerId: _id })
      .skip(skip)
      .limit(limit);

    if (!userListings) {
      return res
        .status(404)
        .json({ message: "You Dont Have Any Listings Yet!" });
    }
    const totalListings = await Listing.countDocuments({ sellerId: _id });
    res.status(200).json({
      success: true,
      listings: userListings,
      totalListings,
      currentPage: page,
      totalPages: Math.ceil(totalListings / limit),
    });
  } catch (e) {
    return res
      .status(e.statusCode || 500)
      .json(e.message || "an  unexpected error occured");
  }
};

const find = catchAsyncErrors(async (req, res, next) => {
  const { listingId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(listingId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Listing ID" });
  }
  if (!listingId) {
    return res.status(400).json({
      success: false,
      message: "Listing ID is required.",
    });
  }
  const listing = await Listing.findById(listingId).populate("reviews");
  if (!listing) {
    return res.status(404).json({
      success: false,
      message: "Listing not found.",
    });
  }
  return res.status(200).json({
    success: true,
    listing: listing,
  });
});

const search = catchAsyncErrors(async (req, res, next) => {
  const {
    query,
    category,
    priceMin,
    priceMax,
    location,
    rating,
    instantBooking,
    page = 1,
    limit = 10,
  } = req.query;
  const filters = {};
  if (query) {
    filters.title = { $regex: query, $options: "i" };
  }
  if (category) {
    filters.category = category;
  }
  if (priceMin || priceMax) {
    filters["sellers.pricing.basePrice"] = {};
    if (priceMin)
      filters["sellers.pricing.basePrice"].$gte = parseFloat(priceMin);
    if (priceMax)
      filters["sellers.pricing.basePrice"].$lte = parseFloat(priceMax);
  }
  if (location) {
    filters.location = { $regex: location, $options: "i" };
  }
  if (rating) {
    filters["sellers.rating"] = { $gte: parseFloat(rating) };
  }
  if (instantBooking !== undefined) {
    filters["sellers.availability.instantBooking"] = instantBooking === "true";
  }
  const skip = (page - 1) * limit;
  const listings = await Listing.find(filters)
    .populate("category", "id name")
    .populate("subCategory", "id name")
    .lean()
    .skip(skip)
    .limit(parseInt(limit));
  if (!listings.length) {
    return res.status(404).json({
      success: false,
      message: "No listings found matching the search criteria.",
    });
  }
  const enrichedListings = await Promise.all(
    listings.map(async (listing) => {
      const sellers = await SellerOffer.find({ listingId: listing._id })
        .populate("sellerId", "name")
        .lean();
      const enrichedSellers = await Promise.all(
        sellers.map(async (seller) => {
          const reviews = await Review.find({
            sellerId: seller.sellerId,
          }).lean();
          const totalReviews = reviews.length;
          const averageRating =
            totalReviews > 0
              ? reviews.reduce((sum, review) => sum + review.rating, 0) /
                totalReviews
              : 0;
          return {
            id: seller.sellerId._id,
            name: seller.sellerId.name,
            rating: averageRating.toFixed(1),
            pricing: seller.pricing,
            availability: seller.availability,
            reviews: totalReviews,
          };
        })
      );
      return {
        ...listing,
        sellers: enrichedSellers,
      };
    })
  );
  return res.status(200).json({
    success: true,
    listings: enrichedListings,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: enrichedListings.length,
    },
  });
});

const addSaved = async (req, res) => {
  const { _id: userId } = req.user;
  const { listingId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Check if the listing is already saved
    if (user.savedListings.includes(listingId)) {
      return res.status(400).json({ message: "Listing already saved." });
    }
    user.savedListings.push(listingId);
    await user.save();
    return res.status(200).json({ message: "Listing added to user" });
  } catch (e) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: e.message });
  }
};

const getSaved = async (req, res) => {
  const { _id: userId } = req.user;
  const { page = 1, limit = 10 } = req.query;

  try {
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    const savedListings = await User.findById(userId)
      .populate({
        path: "savedListings",
        options: { skip, limit: pageSize },
      })
      .select("savedListings");

    if (!savedListings) {
      return res.status(404).json({ message: "User not found" });
    }
    // Count total saved listings for pagination metadata
    const totalListings = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      { $project: { totalSavedListings: { $size: "$savedListings" } } },
    ]);

    const total = totalListings[0]?.totalSavedListings || 0;
    res.status(200).json({
      totalListings: total,
      page: pageNumber,
      totalPages: Math.ceil(total / pageSize),
      listings: savedListings.savedListings,
    });
  } catch (e) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: e.message });
  }
};

const removeSaved = async (req, res) => {
  const { listingId } = req.params;
  const { _id: userId } = req.user;

  try {
    // Find the user and update the savedListings array
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { savedListings: listingId } }, // Remove the listingId from the array
      { new: true } // Return the updated document
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: "Listing removed successfully.",
      savedListings: user.savedListings,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};
export default {
  create,
  find,
  findAll,
  search,
  findUser,
  addSaved,
  getSaved,
  removeSaved,
};
