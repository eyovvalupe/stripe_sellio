// emailRoute.js
import express from 'express';
import mongoose from 'mongoose';
import User from "../models/user.js";
const router = express.Router();
import transporter from '../utils/mailer.js';

// Email sending route
router.post('/send', async(req, res) => {
  const { buyerEmail, sellerId, subject, message } = req.body;
  if (!mongoose.Types.ObjectId.isValid(sellerId)) {
    return res.status(400).json({ success: false, message: 'Invalid Listing ID' });
}
  try{
    const seller = await User.findById(sellerId);
    if(!seller){
        return res.status(404).json({message:"No Seller with this email"});
    }
    const sellerEmail = seller.email;
    // Set up email data
    const mailOptions = {
    from: buyerEmail,              // sender's email (Buyer’s email)
    to: sellerEmail,             // recipient’s email (Seller’s email)
    subject: subject,               // Subject of the email
    text: message,                  // Message body
    };
    // Send email via Mailgun SMTP
    const info = await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: 'Email sent successfully', info });
  }catch(e){
    return res.status(500).json(e.message)
  }
});

export default router;
