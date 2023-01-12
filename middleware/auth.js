import { Prisma, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import jwt from "jsonwebtoken";

const protect = async (req, res, next) => {
  let token;

  if (req.cookies["access-token"]) {
    try {
      //? If token available, 'verify' it and attach user to 'req' excluding PASSWORD
      token = req.cookies["access-token"];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await prisma.user.findUnique({
        where: {
          id: decoded["id"],
        },
      });

      //! Removed 'password' from 'user' object
      const { password, ...otherDetails } = user;

      //? Adding user details to 'req' object
      req.user = otherDetails;
      next();
    } catch (error) {
      console.error(error);
      return res
        .status(401)
        .json({ status: "fail", message: "Not authorized, token failed.." });
    }
  }

  if (!token)
    return res
      .status(401)
      .json({ status: "fail", message: "Not authorized, token failed.." });
};

export default protect;
