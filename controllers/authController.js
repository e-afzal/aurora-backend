import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
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

// 24 hours max age for expiration of token/cookie
let maxAge = 60 * 60 * 24;
const createToken = (userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: maxAge,
  });
  return token;
};

const sendCookie = (res, token) => {
  res.cookie("access-token", token, {
    //! BIG NOTE: If 'secure' is true, you CANNOT get 'req.cookies' access in LOCALHOST
    // secure: true,
    httpOnly: true,
    // Need to set time in milliseconds for cookie. So multiply by 1000
    maxAge: maxAge * 1000,
  });
};

const createUserFromAuth0 = async (req, res) => {
  // Get email
  const { email } = req.body;

  try {
    // Check if email exists in DB
    const userExists = await prisma.user.findUnique({
      where: {
        email: email,
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

    // If user exists, return nothing
    if (userExists) {
      return res.json({ message: "User exists", data: userExists });
    }

    // If user does not exist, create user in DB
    if (!userExists) {
      const user = await prisma.user.create({
        data: {
          email: email,
        },
        select: {
          email: true,
          orders: true,
        },
      });

      return res.status(200).json({ message: "User created", data: user });
    }
  } catch (error) {
    console.log(error.message);
    prismaDefaultError(error, res);
  }
};

const registerUser = async (req, res) => {
  //! Validation is done using 'YUP' in the 'userRouter' file for values received
  //! PRISMA can be used to check ERROR if email already exists on DATABASE
  const { firstName, lastName, email, password } = req.body;

  //? Check if user exists via 'email'
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
    include: { orders: true },
  });

  //? If user exists, RETURN error message
  if (user) return res.status(409).json({ message: "User already exists.." });

  try {
    //? IF user DOES NOT exist, hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        first_name: firstName,
        last_name: lastName,
        email,
        password: hashedPassword,
        addresses: {
          address: "",
          apartment: "",
          city: "",
          country: "",
          phone: "",
        },
      },
    });

    //? Create token for user login after successful registration as a cookie
    const token = createToken(newUser.id);
    // Cookie containing token
    sendCookie(res, token);

    //? Extract password and send remaining details to log user in
    const { password: userPassword, ...otherDetails } = newUser;
    return res
      .status(200)
      .json({ message: "User has been created..", data: otherDetails });
  } catch (error) {
    //? Unique way of checking for errors using 'Prisma'. Check 'Handling Errors' in Prisma Docs.
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      res.json(error.message);
    } else {
      res.json({ message: "Unexpected error", error });
    }
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    //? Check if 'user' exists
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
      include: { orders: true },
    });

    //? If no user found, return error or the 'user' object
    if (user === null)
      return res.status(404).json({ message: "User not found.." });

    //? If user exists, compare password with hashed password
    const result = bcrypt.compareSync(password, user.password);

    // If passwords don't match
    if (!result)
      return res.status(400).json({ message: "Incorrect email or password.." });

    //? If password matches, send JWT via cookie for logging in
    //* 'as string' relates to TYPESCRIPT to use 'process.env.JWT_SECRET'
    const token = createToken(user.id);
    sendCookie(res, token);

    //? Send all user details except 'password'
    //! If you dont rename 'password' to 'userPassword', 'TS' will show ERROR
    const { password: userPassword, ...otherDetails } = user;
    res.status(200).json(otherDetails);
  } catch (error) {
    //? Unique way of checking for errors using 'Prisma'. Check 'Handling Errors' in Prisma Docs.
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      res.json(error.message);
    } else {
      res.status(500).json({ message: "Unexpected error", error });
    }
  }
};

const logoutUser = (req, res) => {
  //? Clearing cookie will remove JWT. So user gets logged out.
  res.clearCookie("access-token", {
    secure: true,
    sameSite: "none",
  });
  res.status(200).json({ message: "User has been logged out." });
};

const profileUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
    });

    if (user) {
      // Send 'req.user' since it contains NO PASSWORD from 'auth.js'
      res.json(req.user);
    } else {
      return res
        .status(404)
        .json({ status: "fail", message: "User not found" });
    }
  } catch (error) {
    //? Unique way of checking for errors using 'Prisma'. Check 'Handling Errors' in Prisma Docs.
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      res.json(error.message);
    } else {
      res.status(500).json({ message: "Unexpected error", error });
    }
  }
};

export {
  createUserFromAuth0,
  registerUser,
  loginUser,
  logoutUser,
  profileUser,
};
