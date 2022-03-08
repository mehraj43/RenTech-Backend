require('dotenv').config();
const nodemailer = require('nodemailer');
const config = require('./auth.config');

const admin = config.admin;
const pass = config.pass;

const transport = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: admin,
    pass: pass,
  },
});

module.exports.sendConfirmationEmail = (name, email, password) => {
  transport
    .sendMail({
      from: admin,
      to: email,
      subject: 'Please confirm your account',
      html: `<h1>Email Confirmation</h1>
        <h2>Hello ${name}</h2>
        <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
        <h1>${password}</h1>
        </div>`,
    })
    .catch((err) => console.log(err));
};
