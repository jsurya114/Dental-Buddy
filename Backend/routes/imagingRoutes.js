import express from "express";
import auth from "../middleware/authMiddleware.js";
import { can } from "../middleware/permissionMiddleware.js";
import {
    getCategories,
    uploadImaging,
    getImagingByPatient,
    getImagingById,
    previewFile,
    uploadMiddleware
} from "../controllers/imagingController.js";

const router = express.Router();

// Get categories (public within auth)
router.get(
    "/categories",
    auth,
    getCategories
);

// Get imaging files by patient
router.get(
    "/",
    auth,
    can("IMAGING", "VIEW"),
    getImagingByPatient
);

// Get single imaging file metadata
router.get(
    "/:id",
    auth,
    can("IMAGING", "VIEW"),
    getImagingById
);

// Preview/download file
router.get(
    "/:id/preview",
    auth,
    can("IMAGING", "VIEW"),
    previewFile
);

// Upload imaging file
router.post(
    "/upload",
    auth,
    can("IMAGING", "CREATE"),
    uploadMiddleware,
    uploadImaging
);

export default router;
