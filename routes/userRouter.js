import { Router } from "express";
const router = Router();

// IMPORTS
import {
  dashboardDetails,
  editAddress,
  deleteAddress,
  getAllConditions,
  sendMessage,
  sendMessageMailersend,
} from "../controllers/userController.js";

// ROUTES
router.post("/overview", dashboardDetails);
router.put("/changeAddress", editAddress);
router.put("/deleteAddress", deleteAddress);
router.get("/conditions/condition", getAllConditions);
router.post("/message", sendMessage);
router.post("/message-mailersend", sendMessage);

export default router;
