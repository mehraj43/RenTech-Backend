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

module.exports.sendConfirmationEmail = (name, email, OTP) => {
  transport
    .sendMail({
      from: admin,
      to: email,
      subject: 'Please confirm your account',
      html: `<h1>Email Confirmation</h1>
        <h2>Hello ${name}</h2>
        <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
        <h1>${OTP}</h1>
        </div>`,
    })
    .catch((err) => console.log(err));
};

module.exports.sendConfirmProduct = (ownEmail, userEmail, message, proID) => {
  transport
  .sendMail({
    from: admin,
    to: userEmail,
    subject: 'Please confirm your account',
    html: `<h1>Email Confirmation</h1>
    <h3>${message}</h3>
    <h2>Product Own MailID : ${ownEmail}</h2>
    <p>Thank you for subscribing. Please confirm your product by clicking on the following link</p>
    <a href="http://localhost:3000/productPage/${proID}">Product</a>
    </div>`,
  })
  .catch((err) => console.log(err));
};

module.exports.sendActivationMessage = (userEmail, message, message2, userName,impMessage) => {
  transport
  .sendMail({
    from: admin,
    to: userEmail,
    subject: `${message}`,
    html: `<h1>${message}</h1>
    <h2>User Name : ${userName}</h2>
    ${impMessage}
    <p>${message2}</p>
    </div>`,
  })
  .catch((err) => console.log(err));
};

module.exports.sendWarning = (userEmail, message, message2, userName, proName) => {
  transport
  .sendMail({
    from: admin,
    to: userEmail,
    subject: `${message}`,
    html: `<h1>${message}</h1>
    <h2>User Name : ${userName}</h2>
    <h4>Product Name : ${proName}</h4>
    <p>${message2}</p>
    </div>`,
  })
  .catch((err) => console.log(err));
};
