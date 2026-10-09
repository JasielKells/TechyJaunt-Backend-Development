const nodemailer = require('nodemailer');

/**
 * Creates a reusable transporter using SMTP credentials from env.
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Sends the email verification link to a newly registered user.
 * @param {string} to - recipient email
 * @param {string} name - user name
 * @param {string} token - RAW verification token
 */
const sendVerificationEmail = async (to, name, token) => {
  const transporter = createTransporter();
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Verify your EventHorizon email',
    html: `
      <h2>Hi ${name},</h2>
      <p>Thanks for signing up for EventHorizon!</p>
      <p>Please verify your email by clicking the link below:</p>
      <p><a href="${verifyUrl}" target="_blank">Verify Email</a></p>
      <p>This link expires in ${process.env.VERIFICATION_TOKEN_EXPIRES_HOURS || 24} hours.</p>
      <p>If you did not create this account, please ignore this email.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendVerificationEmail };