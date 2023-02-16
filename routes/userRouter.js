import { Router } from "express";
const router = Router();

// IMPORTS
import {
  dashboardDetails,
  editAddress,
  deleteAddress,
  getAllConditions,
  sendMessage,
  sendMessageGrid,
} from "../controllers/userController.js";

// ROUTES
router.post("/overview", dashboardDetails);
router.put("/changeAddress", editAddress);
router.put("/deleteAddress", deleteAddress);
router.get("/conditions/condition", getAllConditions);
router.post("/message", sendMessage);
router.post("/message-grid", sendMessageGrid);

export default router;
