import { Router } from "express";
const router = Router();

// Local imports
import {
  fetchAllProducts,
  fetchProductById,
  fetchCategoryProducts,
  searchProducts,
} from "./../controllers/productController.js";

router.get("/", fetchAllProducts);
router.get("/:id", fetchProductById);
router.post("/search", searchProducts);
router.get("/category/:category_type", fetchCategoryProducts);

export default router;
