import express from "express";
import { search } from "../controllers/searchController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected route - only logged in users can search
router.post("/", protect, search);

export default router;
