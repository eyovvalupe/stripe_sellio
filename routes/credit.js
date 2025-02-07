import express from "express";
import dotenv from "dotenv";
import Credit from "../models/creditCard.js";
import { isAuthenticated } from "../middleware/auth.js";
import Stripe from "stripe";
import User from "../models/user.js";

dotenv.config();
const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY}`);
const router = express.Router();

router.get("/all", isAuthenticated, async (req, res) => {
  const { _id } = req.user;
  try {
    const userCredits = await Credit.find({ userId: _id });
    if (!userCredits) {
      return res.status(404).json({ message: "No Credits Found" });
    }
    res.status(200).json(userCredits);
  } catch (e) {
    res.status(400).json(e.message);
  }
});

router.get("/:creditId", isAuthenticated, async (req, res) => {
  const { _id } = req.user;
  const { creditId } = req.params;
  try {
    const userCredit = await Credit.find({ userId: _id, creditId });
    if (!userCredit) {
      return res.status(404).json({ message: "Credit Not Found" });
    }
    res.status(200).json(userCredit);
  } catch (e) {
    res.status(400).json(e.message);
  }
});

router.post("/setup", isAuthenticated, async (req, res) => {
  const { _id } = req.user;
  const { fullName, email } = req.body;

  try {
    let user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    let customerId = user.stripeCustomerId;
    let customer;

    // If user already has a Stripe customer ID, retrieve the customer
    if (customerId) {
      try {
        customer = await stripe.customers.retrieve(customerId);
      } catch (error) {
        console.warn("Stripe customer not found, creating new one.");
      }
    }

    // If no Stripe customer exists, check if there's already a customer with the same email
    if (!customer) {
      const existingCustomers = await stripe.customers.list({ email });

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
        console.log(`Using existing Stripe customer: ${customer.id}`);
      } else {
        // Create a new customer if no match found
        customer = await stripe.customers.create({
          email,
          name: fullName,
        });
        console.log(`Created new Stripe customer: ${customer.id}`);
      }

      // Save the new customer ID to the user record in MongoDB
      user.stripeCustomerId = customer.id;
      user.markModified("stripeCustomerId");
      console.log("before user  =====> ", user);
      await user.save();
      console.log("updated user  =====> ", user);
    }

    // Create Setup Intent
    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      payment_method_types: ["card"],
    });

    res.status(201).json({
      clientSecret: setupIntent.client_secret,
      customerId: customer.id,
    });
  } catch (error) {
    console.error("Error during Stripe setup:", error);
    res.status(500).json({
      message: "Failed to create Stripe Setup Intent. Please try again later.",
      error: error.message,
    });
  }
});

// save the payment method to the database
router.post("/save", isAuthenticated, async (req, res) => {
  const { _id } = req.user;
  const { fullName, email, paymentId } = req.body;

  try {
    const user = await User.findById(_id);
    if (!user || !user.stripeCustomerId) {
      return res
        .status(404)
        .json({ message: "User or Stripe customer not found" });
    }

    // first check if the payment method is already attached to the customer in db
    const paymentMethod = await Credit.findOne({ paymentId });
    if (paymentMethod) {
      return res
        .status(400)
        .json({ message: "Payment method already attached to the customer" });
    }

    // Attach payment method to the customer
    await stripe.paymentMethods.attach(paymentId, {
      customer: user.stripeCustomerId,
    });

    // Set this payment method as the default
    await stripe.customers.update(user.stripeCustomerId, {
      invoice_settings: { default_payment_method: paymentId },
    });

    // Save to our database
    const creditCard = new Credit({
      userId: _id,
      fullName,
      email,
      customerId: user.stripeCustomerId,
      paymentId,
    });

    const savedCard = await creditCard.save();
    res.status(201).json(savedCard);
  } catch (e) {
    console.error("Error during saving payment method:", e);
    res.status(400).json({
      message:
        "An error occurred while saving the payment method. Please try again later.",
    });
  }
});
/* router.post("/cleanup-all-users", async (req, res) => {
    try {
        // 1️⃣ Retrieve all users to get their customerIds
        const users = await user.find({}); // Replace with your User model

        if (users.length === 0) {
            return res.status(404).json({ message: "No users found." });
        }

        for (const user of users) {
            const customerId = user.customerId; // Assuming you store the Stripe customerId in the 'User' model

            if (!customerId) {
                continue; // Skip if there's no associated Stripe customerId
            }

            // 2️⃣ Retrieve the Stripe customer using the stored customerId
            const customer = await stripe.customers.retrieve(customerId);

            if (!customer) {
                continue; // Skip this customer if not found in Stripe
            }

            // 3️⃣ Detach all payment methods attached to the customer
            const paymentMethods = await stripe.paymentMethods.list({
                customer: customer.id,
                type: 'card',
            });

            for (const paymentMethod of paymentMethods.data) {
                await stripe.paymentMethods.detach(paymentMethod.id);
            }

            // 4️⃣ Optionally, delete the customer from Stripe if no longer needed
            await stripe.customers.del(customer.id);

            // 5️⃣ Remove the corresponding user record from your database
            await User.deleteOne({ _id: user._id });
        }

        res.status(200).json({ message: "All users and their Stripe data successfully cleaned up." });

    } catch (e) {
        console.error("Error during cleanup-all-users:", e);
        res.status(500).json({ message: "An error occurred during the cleanup process." });
    }
}); */

router.delete("/delete/:creditId", isAuthenticated, async (req, res) => {
  const { _id } = req.user;
  const { creditId } = req.params;
  try {
    const deletedCredit = await Credit.deleteOne({
      _id: creditId,
      userId: _id,
    });
    if (!deletedCredit) {
      return res.status(404).json({ message: "Credit not found" });
    }
    return res
      .status(200)
      .json({ message: "Credit deleted successfully", deletedCredit });
  } catch (e) {
    return res.status(500).json({ message: "Error deleting credit", e });
  }
});

export default router;
