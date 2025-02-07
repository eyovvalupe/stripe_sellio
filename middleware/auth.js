import ErrorHandler from "../utils/ErrorHandler.js";
import catchAsyncErrors from "./catchAsyncErrors.js";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ErrorHandler("Please login to continue", 401));
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return next(new ErrorHandler("Token missing from Authorization header", 401));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return next(new ErrorHandler("User not found", 404));
    }
    next();
  } catch (error) {
    return next(new ErrorHandler("Invalid or expired token", 401));
  }
});

export const requiredRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.userType)) {
      return next(
        new ErrorHandler(
          `${req.user?.role || "user"} cannot access this resource`,
          403
        )
      );
    }
    next();
  };
};
