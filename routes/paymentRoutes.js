import { Router } from "express";
const router = Router();

// Local imports
import {
  makePayment,
  retrieveTest,
  retrievePaymentDetailsById,
} from "./../controllers/paymentController.js";

//! All the below routes should be PROTECTED. Logged in users should ONLY
//! be allowed to access the below routes.
router.post("/", makePayment);
router.post("/retrieve", retrieveTest);
router.get("/retrieve/:id", retrievePaymentDetailsById);

export default router;
