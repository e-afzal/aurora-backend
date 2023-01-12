import nodemailer from "nodemailer";

export default async function sendContactMessage(
  name,
  senderEmail,
  subject,
  message,
  receiverMail,
  receiverPass
) {
  const output = `
  <h2>Received enquiry from Aurora website</h2>
  <ul>
  <li>Name: ${name}</li>
  <li>Email: ${senderEmail}</li>
  <li>Subject: ${subject}</li>
  </ul>
  <h3>Message from enquirer:</h3>
  <p>${message}</p>
  `;

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: `${receiverMail}`, // generated ethereal user
      pass: `${receiverPass}`, // generated ethereal password
    },
    tls: {
      rejectUnauthorized: false, // Done if contact form sent via LOCALHOST
    },
  });

  let mailOptions = {
    from: `Contact Form <${receiverMail}>`, // sender address
    from: '"Nodemailer Contact" <essam.afzal@outlook.com>', // sender address
    to: `${receiverMail}`, // list of receivers
    subject, // Subject line
    text: `${message}`, // plain text body
    html: output, // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return { status: "fail", message: "Error encountered" };
    }

    // If successful, do the following:
    // console.log(info.messageId);
    return { status: "success", message: "Message sent successfully!" };
    // We want frontend to redirect to other page with what we want
    // Like redirecting to page that says 'email sent' or something
  });
}
