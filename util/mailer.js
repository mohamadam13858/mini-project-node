const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525,  
  secure: false,  
  auth: {
    user: '77a2f61d4f8513', 
    pass: '7e02893e9d5e9b'          
  }
});


const sendEmail = async (to, subject, text, html = '') => {
  try {
    const info = await transporter.sendMail({
      from: '"Your App" <no-reply@yourapp.com>', 
      to: to,
      subject: subject,
      text: text,
      html: html || text  
    });
    console.log('Email sent: ', info.messageId);
  } catch (error) {
    console.error('Error sending email: ', error);
  }
};

module.exports = sendEmail;