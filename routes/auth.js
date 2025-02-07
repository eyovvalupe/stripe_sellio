import express from "express";

import AuthController from "../controller/auth.js";
import upload from "../middleware/multer.js";
import { isAuthenticated } from "../middleware/auth.js";
const router = express.Router();



router.post(
  "/register",
  upload.single("profileImage"),
  AuthController.register
);

router.post("/login", AuthController.login);


router.put(
  "/update",
  isAuthenticated,
  AuthController.update
)
export default router;
