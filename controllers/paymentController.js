import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
import { Prisma, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const prismaDefaultError = (error, res) => {
  //? Unique way of checking for errors using 'Prisma'. Check 'Handling Errors' in Prisma Docs.
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    res.json(error.message);
  } else {
    res.status(500).json({ message: "Unexpected error", error });
  }
};

const makePayment = async (req, res) => {
  //? Get 'cartItems' ARRAY from POST request from 'shipping' page
  const cartItems = req.body;
  try {
    //? Create checkout session
    //? For more info, refer: https://stripe.com/docs/api/checkout/sessions/create?lang=node
    const session = await stripe.checkout.sessions.create({
      submit_type: "pay",
      mode: "payment",
      payment_method_types: ["card"],
      // shipping_address_collection: {
      //   allowed_countries: ["US", "CA"],
      // },
      //? Looping through cartItems from FRONTEND
      line_items: cartItems.map((eachItem) => {
        return {
          price_data: {
            currency: "aed",
            tax_behavior: "inclusive",
            product_data: {
              name: eachItem.productTitle,
              // images: [item.image.data.atrributes.formats.thumbnail.url],
            },
            unit_amount: eachItem.price * 100,
          },
          quantity: eachItem.quantity,
        };
      }),
      //? 'query string' is as per 'stripe' docs
      success_url: `${req.headers.origin}/checkout/confirmation?session_id={CHECKOUT_SESSION_ID}&session_status=1`,
      cancel_url: `${req.headers.origin}/cancelled`,
    });

    //! You must send this 'session' to the FRONTEND to get the session ID
    //! or you wont be directed to the STRIPE payment page!
    res.status(200).json(session);
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ status: "fail", message: error.message });
  }
};

const retrievePaymentDetailsById = async (req, res) => {
  try {
    const session_id = req.params.id;

    //? If session data available, send what is needed.
    //? i.e. payment_intent id, payment_status
    const { payment_intent, payment_status } =
      await stripe.checkout.sessions.retrieve(session_id);

    res.json({
      status: "success",
      stripe_data: { payment_status, payment_intent },
    });
  } catch (error) {
    prismaDefaultError(error, res);
  }
};

const retrieveTest = async (req, res) => {
  function calculateAmounts(itemsArr) {
    //? Calculation of 'subtotalAmt', 'shippingAmt', 'taxAmt', 'totalAmt'
    // Calculate Subtotal Price
    const subtotalAmt =
      itemsArr &&
      itemsArr.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
    // Calculate Taxes
    const taxAmt = Math.ceil(subtotalAmt * (5 / 100));
    // Calculate Total Price
    const totalAmt = Math.ceil(subtotalAmt + taxAmt);

    return { subtotalAmt, taxAmt, totalAmt };
  }

  try {
    const { session_id, cartItems, userInfo } = req.body;

    //? Get 'payment_intent' and 'payment_status' from Stripe
    const { payment_intent, payment_status } =
      await stripe.checkout.sessions.retrieve(session_id);

    //! Check if 'order' with the same 'payment_intent' exists,
    //! if so, DO NOT create order and send ERROR
    const orderExists = await prisma.orders.findUnique({
      where: {
        payment_intent: payment_intent,
      },
    });

    //! If order with this 'payment_intent' already exists, return SAME order
    //! with the 'payment_intent' and 'payment_status'
    if (orderExists) {
      const { subtotalAmt, taxAmt, totalAmt } = calculateAmounts(
        orderExists.cartItems
      );
      return res.json({
        status: "fail",
        message: "Order exists.",
        data: {
          ...orderExists,
          subtotalAmt,
          taxAmt,
          totalAmt,
        },
      });
    }

    //* If order with SAME 'payment_intent' DOES NOT exist, create NEW order
    const { subtotalAmt, taxAmt, totalAmt } = calculateAmounts(cartItems);
    const order = await prisma.orders.create({
      data: {
        cartItems,
        shipping: { shippingAddress: userInfo, shippingMethod: "standard" },
        payment_status,
        payment_intent,
        subtotalAmt,
        taxAmt,
        totalAmt,
        // userId,
      },
    });

    return res.json({
      status: "success",
      data: order,
    });
  } catch (error) {
    prismaDefaultError(error, res);
  }
};

export { makePayment, retrievePaymentDetailsById, retrieveTest };
