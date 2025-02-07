import path from "path";

import User from "../models/user.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import sendToken from "../utils/jwtToken.js";

const register = catchAsyncErrors(async (req, res, next) => {
  try {
    const { fullName, email, password, phoneNumber   } = req.body;
    if (!fullName || !email || !password || !phoneNumber) {
      return next(new ErrorHandler("Please provide the all fields", 400));
    }
    const userEmail = await User.findOne({ email });
    if (userEmail) {
      return next(new ErrorHandler("User already exists", 422));
    }
    const user = await User.create({
      fullName: fullName,
      email: email,
      password: password,
      phoneNumber: phoneNumber,
    }).catch((e) => {
      return next(new ErrorHandler(e.message, 400));
    });
    sendToken(user, 200, res);
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

const login = catchAsyncErrors(async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ErrorHandler("Please provide the all fields", 400));
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(new ErrorHandler("User doesn't exist", 422));
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return next(new ErrorHandler("Please provide correct password", 422));
    }
    sendToken(user, 200, res);
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});


const update = async(req,res)=>{
  const userId = req.user._id;
  const updatedData = req.body;
  try{
    const user = await User.findByIdAndUpdate(userId,updatedData,{new:true,runValidators:true});
    res.status(200).json(user);
  }catch(e){
    res.status(500).json({ message: 'Failed to update user', e });
  }
}
export default {
  register,
  login,
  update
};
