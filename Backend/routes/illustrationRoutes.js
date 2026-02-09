import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import authMiddleware from "../middleware/authMiddleware.js";
import { can } from "../middleware/permissionMiddleware.js";
import {
    createIllustration,
    getIllustrations,
    deleteIllustration
} from "../controllers/illustrationController.js";

const router = express.Router();

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = "uploads/illustrations";
        // Ensure directory exists
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
        const ext = path.extname(file.originalname);
        cb(null, `illustration-${uniqueSuffix}${ext}`);
    }
});

// File Filter
const fileFilter = (req, file, cb) => {
    const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
    const allowedVideoTypes = ["video/mp4", "video/webm", "video/quicktime"]; // .mov is video/quicktime

    if (allowedImageTypes.includes(file.mimetype) || allowedVideoTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only JPG, PNG, WEBP images and MP4, WEBM, MOV videos are allowed."), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit for videos
    }
});

// Routes

// Get all illustrations (Requires VIEW permission)
router.get(
    "/",
    authMiddleware,
    can("ILLUSTRATION", "VIEW"),
    getIllustrations
);

// Upload/Create illustration (Requires CREATE permission)
router.post(
    "/",
    authMiddleware,
    can("ILLUSTRATION", "CREATE"),
    upload.single("file"), // Expects field name 'file'
    createIllustration
);

// Delete illustration (Requires DELETE permission)
router.delete(
    "/:id",
    authMiddleware,
    can("ILLUSTRATION", "DELETE"),
    deleteIllustration
);

export default router;
