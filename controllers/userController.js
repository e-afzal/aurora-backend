import nodemailer from "nodemailer";
// import sgMail from "@sendgrid/mail";
import { Prisma, PrismaClient } from "@prisma/client";

// sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const prisma = new PrismaClient();

const prismaDefaultError = (error, res) => {
  //? Unique way of checking for errors using 'Prisma'. Check 'Handling Errors' in Prisma Docs.
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    res.json(error.message);
  } else {
    res.status(500).json({ message: "Unexpected error", error });
  }
};

//? For dashboard 'overview', fetch ALL orders based on user ID
const dashboardDetails = async (req, res) => {
  const { user_id } = req.body;

  try {
    // Find if user exists
    const foundUser = await prisma.user.findUnique({
      where: {
        id: Number(user_id),
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        addresses: true,
        orders: {
          select: {
            orderNumber: true,
            createdAt: true,
            fulfillmentStatus: true,
            totalAmt: true,
            shipping: true,
          },
        },
      },
    });

    // If user doesn't exist
    if (!foundUser) {
      return res.json({
        status: "fail",
        message: "User does not exist",
      });
    }

    // If user exists, send required order-related information
    return res.json({
      status: "success",
      user: foundUser,
    });
  } catch (error) {
    prismaDefaultError(error, res);
  }
};

//? Edit user address
const editAddress = async (req, res) => {
  const { user_id, address, apartment, city, country, phone } = req.body;

  try {
    // Find if user exists
    const foundUser = await prisma.user.findUnique({
      where: {
        id: Number(user_id),
      },
      select: {
        addresses: true,
      },
    });

    // If user doesn't exist
    if (!foundUser) {
      return res.json({
        status: "fail",
        message: "User does not exist",
      });
    }

    // Edit address
    const newAddress = {
      address: address || foundUser.addresses.address,
      apartment: apartment || foundUser.addresses.apartment,
      city: city || foundUser.addresses.city,
      country: country || foundUser.addresses.country,
      phone: phone || foundUser.addresses.phone,
    };

    const editedAddress = await prisma.user.update({
      where: {
        id: Number(user_id),
      },
      data: {
        addresses: newAddress,
      },
      select: {
        addresses: true,
        createdAt: true,
        email: true,
        first_name: true,
        last_name: true,
        id: true,
        orders: true,
      },
    });

    return res.json(editedAddress);
  } catch (error) {
    prismaDefaultError(error, res);
  }
};

//? Delete user address
const deleteAddress = async (req, res) => {
  const { user_id } = req.body;

  try {
    // Find if user exists
    const foundUser = await prisma.user.findUnique({
      where: {
        id: Number(user_id),
      },
      select: {
        addresses: true,
      },
    });

    // If user doesn't exist
    if (!foundUser) {
      return res.json({
        status: "fail",
        message: "User does not exist",
      });
    }

    // Edit address
    const newAddress = {
      address: "",
      apartment: "",
      city: "",
      country: "",
      phone: "",
    };

    const editedAddress = await prisma.user.update({
      where: {
        id: Number(user_id),
      },
      data: {
        addresses: newAddress,
      },
      select: {
        addresses: true,
        createdAt: true,
        email: true,
        first_name: true,
        last_name: true,
        id: true,
        orders: true,
      },
    });

    return res.json(editedAddress);
  } catch (error) {
    prismaDefaultError(error, res);
  }
};

//? Get Conditions
const getAllConditions = async (req, res) => {
  //! Need to check if ADMIN first, only then allow access, otherwise 'FORBIDDEN'
  try {
    const conditions = await prisma.conditions.findMany({
      select: {
        shipping: true,
        refundAndExchange: true,
        accountsAndMembership: true,
        repairsAndDefects: true,
        payment: true,
        websiteUsage: true,
        shoppingAtAurora: true,
        pricingPolicy: true,
        propertyAndRisk: true,
        safetyOfPersonalDetails: true,
        copyrightAndTrademarks: true,
        content: true,
        thirdPartyLinks: true,
        acceptanceOfTerms: true,
        backups: true,
      },
    });

    if (!conditions) {
      return res.json({ status: "fail", message: "No conditions found." });
    }

    res.json(...conditions);
  } catch (error) {
    prismaDefaultError(error, res);
  }
};

//? Send message via contact form
const sendMessage = async (req, res) => {
  const { name, senderEmail, subject, message } = req.body;

  const receiverMail = process.env.SENDER_EMAIL;
  const receiverPass = process.env.SENDER_PASS;

  const output = `
  <h2>Received enquiry from Aurora website</h2>
  <ul>
  <li>Name: ${name.trim()}</li>
  <li>Email: ${senderEmail.trim()}</li>
  <li>Subject: ${subject}</li>
  </ul>
  <h3>Message from enquirer:</h3>
  <p>${message}</p>
  `;

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: "hotmail",
    host: "smtp-mail.outlook.com",
    auth: {
      user: receiverMail, // generated ethereal user
      pass: receiverPass, // generated ethereal password
    },
    // port: 25, //587 is original
    // secure: false, // true for 465, false for other ports like 587
    tls: {
      rejectUnauthorized: false, // 'false' if contact form sent via LOCALHOST
      // ciphers: "SSLv3",
    },
  });

  let mailOptions = {
    from: `"Nodemailer Contact" <${receiverMail}>`, // sender address
    to: receiverMail, // list of receivers
    subject: subject, // Subject line
    text: message, // plain text body
    html: output, // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.status(200).json({ success: false });
    }

    // If successful, do the following:
    return res.status(200).json({ success: true });
    // We want frontend to redirect to other page with what we want
    // Like redirecting to page that says 'email sent' or something
  });
};

//? Send message via contact form (SENDGRID)
// const sendMessageGrid = async (req, res) => {
//   const { name, senderEmail, subject, message } = req.body;
//   const msg = {
//     to: "essam.afzal@outlook.com", // Change to your recipient
//     from: "eadev.90@gmail.com", // Change to your verified sender
//     subject: subject,
//     text: message,
//     html: `Received email from ${name} with email as ${senderEmail} showing a message as <strong>${message}</strong>`,
//   };

//   sgMail
//     .send(msg)
//     .then((data) => {
//       res.status(200).json({ success: true });
//     })
//     .catch((err) => {
//       res.json({ success: false });
//       console.log(err.message);
//     });
// };

export {
  dashboardDetails,
  deleteAddress,
  editAddress,
  getAllConditions,
  sendMessage,
  // sendMessageGrid,
};
