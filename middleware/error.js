import fs from "fs";
import ErrorHandler from "../utils/ErrorHandler.js";

export default (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal server Error";
  // wrong mongodb id error
  if (err.name === "CastError") {
    const message = `Resources not found with this id.. Invalid ${err.path}`;
    err = new ErrorHandler(message, 400);
  }
  // Duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate key ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(message, 400);
  }
  // wrong jwt error
  if (err.name === "JsonWebTokenError") {
    const message = `Your url is invalid please try again letter`;
    err = new ErrorHandler(message, 400);
  }
  // jwt expired
  if (err.name === "TokenExpiredError") {
    const message = `Your Url is expired please try again letter!`;
    err = new ErrorHandler(message, 400);
  }
  const filename = req.file?.filename;
  if (filename) {
    const filePath = `upload/${filename}`;
    fs.unlink(filePath, (err) => {
      if (err) {
        console.log(`Error deleting file: ${err}`);
      }
    });
  }
  res.status(err.statusCode).json({
    success: false,
    message: err.message?.toLowerCase(),
  });
};
