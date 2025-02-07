import mongoose from "mongoose";

const planSchema = new mongoose.Schema({
    planType: {
        type:String,
        enum:["basic","premium","featured"],
        default:"basic",
        required:true
            },
    planPrice:{
        type:Number,
        required:true
    },
    features:[{
            type:String,
            required:true
        }],
    rank:{
        type:Number,
        enum:[1,2,3],
        default:1,
        required:true
    }
},{timestamps:true,versionKey:false});


const Plan = mongoose.model("Plan",planSchema);

export default Plan;