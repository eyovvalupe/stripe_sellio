import express from "express";
import AuthRoutes from "./auth.js";
import ListingRoutes from "./listing.js";
import CreditRoutes from "./credit.js"
import PlanRoutes from "./plan.route.js";
import ReviewRoutes from "./review.js"
import CategoriesRoutes from "./category.route.js";
import EmailRouter from "./email.route.js";

const router = express.Router();
router.use("/auth", AuthRoutes);
router.use("/listing", ListingRoutes);
router.use("/credit",CreditRoutes);
router.use("/plan",PlanRoutes);
router.use("/review",ReviewRoutes);
router.use("/category",CategoriesRoutes);
router.use("/email",EmailRouter);
/* router.use("/payment",PaymentRoutes) */

export default router;
