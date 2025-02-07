import express from "express";
import mongoose from "mongoose";
import Listing from "../models/listing.js";


const router = express.Router();
router.get("/all",async(req,res)=>{  
    try{
        const categories = await Listing.aggregate([
            {$group:{_id:"$serviceCategory"},},
            {$sort:{_id:1}}
        ]);
        const catNames = categories.map(cat=> cat._id)
        res.status(201).json(catNames);
    }catch(e){
        res.status(400).json(e);
    }
});





export default router;