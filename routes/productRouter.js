import { Router } from "express";
const router = Router();

// Local imports
import {
  fetchNewArrivals,
  fetchAllProducts,
  fetchProductById,
  fetchCategoryProducts,
  searchProducts,
} from "./../controllers/productController.js";

router.get("/arrivals", fetchNewArrivals);
router.get("/", fetchAllProducts);
router.get("/:id", fetchProductById);
router.post("/search", searchProducts);
router.get("/category/:category_type", fetchCategoryProducts);

export default router;
