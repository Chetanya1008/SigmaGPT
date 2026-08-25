import express from "express";
import { sendMessage } from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";
import { handleUpload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/chat", protect, handleUpload, sendMessage);

export default router;
