const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) Create a Transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      password: process.env.EMAIL_PASSWORD,
    },
  });
  // 2) Define email options
  const mailOptions = {
    from: 'Naeem Rahmat <admin@bootcamp.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  // 3) Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
