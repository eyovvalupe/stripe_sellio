import express from "express";

import ListingController from "../controller/listing.js";
import { isAuthenticated, requiredRoles } from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.post(
  "/create",
  isAuthenticated,
  upload.fields([
    {name:"logo" ,maxCount:1},
    {name:"serviceImages",maxCount:10}
  ]),
  ListingController.create
);
router.get(
  "/find/:listingId",
  ListingController.find
);

router.get(
  "/all",
ListingController.findAll,
);

router.get(
  "/search", 
  ListingController.search
);



router.get(
  "/user/find/all",
  isAuthenticated,
  ListingController.findUser
);
router.get(
  "/saved/find",
  isAuthenticated,
  ListingController.getSaved
)
router.post(
  "/saved/add/:listingId",
  isAuthenticated,
  ListingController.addSaved
);
router.delete(
  "/saved/delete/:listingId",
  isAuthenticated,
  ListingController.removeSaved
)


export default router;
