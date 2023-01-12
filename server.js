import express from "express";
const app = express();
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cloudinary from "cloudinary";
// import cors from "cors";

// Route Imports
import productRoutes from "./routes/productRouter.js";
import collectionRoutes from "./routes/collectionRouter.js";
import authRoutes from "./routes/authRouter.js";
import orderRoutes from "./routes/orderRouter.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import userRoutes from "./routes/userRouter.js";
import adminRoutes from "./routes/adminRouter.js";

// Body and cookie parser
app.use(express.json());
app.use(cookieParser());

// To use 'process.env' in files
dotenv.config();

//! If cors 'enabled', you wont be able to make request from frontend to local server. RE-ENABLE after everything is DONE!
// app.use(cors());

// CORS TO WORK
app.use(function (req, res, next) {
  // res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  next();
});

// CLOUDINARY CONFIG
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Routes
app.use("/api/products", productRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);

// Listen for requests
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
