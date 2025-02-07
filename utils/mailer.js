// mailer.js
import nodemailer from "nodemailer";

// Setup the Mailgun transporter using the SMTP credentials
const transporter = nodemailer.createTransport({
  service: 'Mailgun',
  host: 'smtp.mailgun.org',
  port: 587,
  auth: {
    user: process.env.mailUsername, // Your Mailgun SMTP username
    pass: process.env.mailPassword,        // Your Mailgun SMTP password
  },
});

export default transporter;
