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

const getOrderById = async (req, res) => {
  const { order_id } = req.body;

  try {
    //Check if order exists
    const orderExists = await prisma.order.findUnique({
      where: {
        orderNumber: Number(order_id),
      },
    });

    if (!orderExists) {
      return res.json({ status: "fail", message: "No order found" });
    }

    return res.json({ status: "success", data: orderExists });
  } catch (error) {
    prismaDefaultError(error, res);
  }
};

export { getOrderById };
