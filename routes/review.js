import express from "express";

import ReviewController from "../controller/review.js";
import { isAuthenticated, requiredRoles } from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const router = express.Router();


router.post(
  "/create",
  isAuthenticated,
  requiredRoles("buyer"),
  ReviewController.create
);

export default router;
