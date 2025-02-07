import express from "express";
import mongoose from "mongoose";
import Plan from "../models/plan.model.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.post("/create",isAuthenticated,async(req,res)=>{
    const {planType,planPrice,features} = req.body;
    
    try{
        const plan = await Plan.create({
            planType:planType,
            planPrice:planPrice,
            features:features
        });
        const savedPlan = await plan.save();
        res.status(201).json(savedPlan);
    }catch(e){
        res.status(e.statusCode).json(e.message);
    }
});

router.get("/all",async(req,res)=>{
    try{
        const allPlans = await Plan.find();
        if(!allPlans){
            return res.status(404).json({message:"No Plans Found"});
        }
        res.status(200).json(allPlans);
    }catch(e){
        res.status(e.statusCode).json(e.message);
    }
});

router.get("/:planId",async(req,res)=>{
    const {planId} = req.params;
    if (!mongoose.Types.ObjectId.isValid(planId)) {
        return res.status(400).json({ message: 'Invalid product ID' });
    }
    try{
        const plan = await Plan.findById(planId);
        if(!plan){
            return res.status(404).json({message:"No Plan Found"});
        }
        res.status(200).json(plan);
    }catch(e){
        res.status(e.statusCode).json(e.message);
    }
})

export default router;