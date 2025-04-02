const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "mbkaneriya1998@gmail.com",
    pass: "rmfnynwipqbiixyc",
  },
});

let sendEmail = (to, subject, data) => {
  return transporter.sendMail({
    from: '"👻" <mbkaneriya1998@gmail.com>',
    to: to,
    subject: subject,
    text: data,
  });
};

module.exports = sendEmail;