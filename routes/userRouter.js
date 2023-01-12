import { Router } from "express";
const router = Router();

// IMPORTS
import {
  dashboardDetails,
  editAddress,
  deleteAddress,
  getAllConditions,
  sendMessage,
} from "../controllers/userController.js";

// ROUTES
router.post("/overview", dashboardDetails);
router.put("/changeAddress", editAddress);
router.put("/deleteAddress", deleteAddress);
router.get("/conditions/condition", getAllConditions);
router.post("/message", sendMessage);

export default router;
