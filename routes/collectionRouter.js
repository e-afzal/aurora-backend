import { Router } from "express";
const router = Router();

// Local imports
import {
  getMainCollection,
  getAllCollections,
  getSubCollection,
  browseMainCollection,
} from "./../controllers/collectionController.js";

router.get("/main/:main_jewelry_title", getMainCollection);
router.get("/:collection_name", getSubCollection);
router.get("/collection/collections", getAllCollections);

router.post("/browse", browseMainCollection);

export default router;
