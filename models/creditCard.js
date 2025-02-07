import mongoose from "mongoose";

const creditSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to User model
        required: [true, "User ID is required"]
    },
    fullName: {
        type: String,
        required: [true, "Please Enter your full name"],
        trim: true
    },
    email:{
        type:String
    },
    paymentId:{
        type:String,
    },
    customerId:{
        type:Object
    }
},{timestamps:true,versionKey:false});

const Credit = mongoose.model("Credit",creditSchema);

export default Credit;