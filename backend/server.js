const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
app.use(bodyParser.json());

const OTP_STORE = {}; // Temporary storage for OTPs

// Email transport configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-email-password',
  },
});

// Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP
app.post('/send-otp', (req, res) => {
  const { email } = req.body;
  const otp = generateOTP();
  OTP_STORE[email] = otp;

  // Send OTP via email
  transporter.sendMail(
    {
      from: 'your-email@gmail.com',
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}`,
    },
    (err) => {
      if (err) return res.json({ success: false, message: 'Error sending OTP.' });
      res.json({ success: true });
    }
  );
});

// Sign Up
app.post('/sign-up', (req, res) => {
  const { role, email, otp } = req.body;

  if (OTP_STORE[email] !== otp) return res.json({ success: false, message: 'Invalid OTP.' });

  const userData = { role, email, date: new Date() };
  fs.writeFileSync(`./users/${email}.json`, JSON.stringify(userData, null, 2));
  delete OTP_STORE[email];
  res.json({ success: true });
});

// Start server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
