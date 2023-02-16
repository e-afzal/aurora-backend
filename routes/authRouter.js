import { Router } from "express";
const router = Router();

// Local exports
import {
  registerUser,
  loginUser,
  logoutUser,
  profileUser,
  createUserFromAuth0,
} from "../controllers/authController.js";

// 'Body' Validation imports
import validation from "./../middleware/validation.js";
import userSchema from "./../validation/userValidation.js";
import protect from "../middleware/auth.js";

// Auth Middleware
//? Registering user using middleware
router.post("/register", validation(userSchema), registerUser);
router.post("/register/auth0", createUserFromAuth0);

router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.get("/profile", protect, profileUser);

export default router;
