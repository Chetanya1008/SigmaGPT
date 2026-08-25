import express from "express";
import {
  getThreads,
  getThreadMessages,
  renameThread,
  deleteThread,
} from "../controllers/threadController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/threads", protect, getThreads);
router.get("/threads/:threadId", protect, getThreadMessages);
router.put("/threads/:threadId", protect, renameThread);
router.delete("/threads/:threadId", protect, deleteThread);

export default router;
