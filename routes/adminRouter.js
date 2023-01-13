import { Router } from "express";
const router = Router();

// IMPORTS
import {
  getAllMainCollections,
  getMainCollectionById,
  createMainCollection,
  updateMainCollectionById,
  deleteMainCollectionById,
  deleteMainCollectionImage,
  getAllCollections,
  getCollectionById,
  updateCollectionById,
  createCollection,
  deleteCollectionById,
  deleteCollectionImage,
  getAllProducts,
  getProductById,
  postNewProduct,
  updateProductById,
  deleteProductById,
  getAllUsers,
  getUserById,
  deleteUserById,
  getAllOrders,
  getOrderById,
  getAllConditions,
  postNewCondition,
  updateConditionById,
  deleteConditionById,
  getAllCategories,
  getCategoryById,
  postNewCategory,
  updateCategoryById,
  deleteCategoryById,
  deleteCategoryImage,
  findCollectionForDropdown,
} from "../controllers/adminController.js";

//? MAIN-COLLECTION ROUTES (E.g. Fine Jewelry, Demi-Fine, etc)
router.get("/main-collections", getAllMainCollections);
router.get("/main-collections/:id", getMainCollectionById);
router.put("/main-collections/:id", updateMainCollectionById);
router.post("/main-collections", createMainCollection);
router.delete("/main-collections/:id", deleteMainCollectionById);
router.delete(
  "/main-collections/delete-image/:public_id",
  deleteMainCollectionImage
);

//? SUB-COLLECTION ROUTES (E.g. Aurora)
router.get("/collections", getAllCollections);
router.get("/collections/:id", getCollectionById);
router.put("/collections/:id", updateCollectionById);
router.post("/collections", createCollection);
router.delete("/collections/:id", deleteCollectionById);
router.delete("/collections/delete-image/:public_id", deleteCollectionImage);
router.get("/collections/select/:id", findCollectionForDropdown);

//? CATEGORIES ROUTES
router.get("/categories", getAllCategories);
router.get("/categories/:id", getCategoryById);
router.post("/categories", postNewCategory);
router.put("/categories/:id", updateCategoryById);
router.delete("/categories/:id", deleteCategoryById);
router.delete("/categories/delete-image/:public_id", deleteCategoryImage);

//? PRODUCT ROUTES
router.get("/products", getAllProducts);
router.get("/products/:id", getProductById);
router.post("/products", postNewProduct);
router.put("/products/:id", updateProductById);
router.delete("/products/:id", deleteProductById);

//? ORDER ROUTES
router.get("/orders", getAllOrders);
router.get("/orders/:id", getOrderById);

//? USER ROUTES
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.delete("/users/:id", deleteUserById);

//? CONDITIONS
router.get("/conditions", getAllConditions);
router.post("/conditions", postNewCondition);
router.put("/conditions", updateConditionById);
router.delete("/conditions", deleteConditionById);

export default router;
