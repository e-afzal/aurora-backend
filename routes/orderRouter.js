import { Router } from "express";
const router = Router();

// LOCAL IMPORTS
import { getOrderById } from "../controllers/orderController.js";

// ROUTES
router.post("/getOrder", getOrderById);

export default router;
