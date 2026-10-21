import { Router } from "express";
import {
  getAllPublishedContent,
  getPublishedSection,
  streamContentUpdates,
} from "../controllers/contentController.js";

const router = Router();

router.get("/stream", streamContentUpdates);
router.get("/", getAllPublishedContent);
router.get("/:key", getPublishedSection);

export default router;
