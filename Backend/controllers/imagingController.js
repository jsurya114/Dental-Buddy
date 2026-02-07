import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";
import Imaging, { CATEGORIES } from "../models/Imaging.js";

// Get directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload directory
const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "imaging");

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName = `${uuidv4()}${ext}`;
        cb(null, uniqueName);
    }
});

// File filter - allow images and PDFs
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf"
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only images and PDFs are allowed."), false);
    }
};

// Multer instance
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Export multer middleware
export const uploadMiddleware = upload.single("file");

/**
 * Get imaging categories
 * GET /api/imaging/categories
 */
export const getCategories = async (req, res) => {
    res.json({
        success: true,
        data: CATEGORIES
    });
};

/**
 * Upload imaging file
 * POST /api/imaging/upload
 */
export const uploadImaging = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }

        const { patientId, caseSheetId, procedureId, category, title, description } = req.body;

        // Validate required fields
        if (!patientId || !category || !title) {
            // Delete uploaded file if validation fails
            fs.unlinkSync(req.file.path);
            return res.status(400).json({
                success: false,
                message: "patientId, category, and title are required"
            });
        }

        // Validate category
        if (!CATEGORIES.includes(category)) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({
                success: false,
                message: `Invalid category. Must be one of: ${CATEGORIES.join(", ")}`
            });
        }

        // Create imaging record
        const imaging = new Imaging({
            patientId,
            caseSheetId: caseSheetId || null,
            procedureId: procedureId || null,
            category,
            title,
            description: description || "",
            fileKey: req.file.filename,
            originalName: req.file.originalname,
            fileType: req.file.mimetype,
            fileSize: req.file.size,
            uploadedBy: req.user.userId
        });

        await imaging.save();

        // Populate for response
        await imaging.populate("uploadedBy", "fullName");

        res.status(201).json({
            success: true,
            message: "File uploaded successfully",
            data: imaging
        });
    } catch (error) {
        console.error("Upload imaging error:", error);
        // Clean up file if error occurs
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({
            success: false,
            message: "Failed to upload file"
        });
    }
};

/**
 * Get imaging files by patient
 * GET /api/imaging?patientId=...
 */
export const getImagingByPatient = async (req, res) => {
    try {
        const { patientId, category } = req.query;

        if (!patientId) {
            return res.status(400).json({
                success: false,
                message: "patientId is required"
            });
        }

        const query = { patientId };
        if (category) query.category = category;

        const imaging = await Imaging.find(query)
            .populate("uploadedBy", "fullName")
            .populate("caseSheetId", "_id")
            .populate("procedureId", "name")
            .sort({ uploadedAt: -1 });

        // Group by category
        const grouped = CATEGORIES.reduce((acc, cat) => {
            acc[cat] = imaging.filter(img => img.category === cat);
            return acc;
        }, {});

        res.json({
            success: true,
            data: imaging,
            grouped,
            total: imaging.length
        });
    } catch (error) {
        console.error("Get imaging error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch imaging files"
        });
    }
};

/**
 * Get single imaging file metadata
 * GET /api/imaging/:id
 */
export const getImagingById = async (req, res) => {
    try {
        const { id } = req.params;

        const imaging = await Imaging.findById(id)
            .populate("patientId", "patientId fullName")
            .populate("uploadedBy", "fullName")
            .populate("caseSheetId", "_id")
            .populate("procedureId", "name");

        if (!imaging) {
            return res.status(404).json({
                success: false,
                message: "Imaging file not found"
            });
        }

        res.json({
            success: true,
            data: imaging
        });
    } catch (error) {
        console.error("Get imaging by ID error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch imaging file"
        });
    }
};

/**
 * Preview/Download imaging file
 * GET /api/imaging/:id/preview
 */
export const previewFile = async (req, res) => {
    try {
        const { id } = req.params;

        const imaging = await Imaging.findById(id);

        if (!imaging) {
            return res.status(404).json({
                success: false,
                message: "Imaging file not found"
            });
        }

        const filePath = path.join(UPLOAD_DIR, imaging.fileKey);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: "File not found on server"
            });
        }

        // Set content type
        res.setHeader("Content-Type", imaging.fileType);
        res.setHeader("Content-Disposition", `inline; filename="${imaging.originalName}"`);

        // Stream file
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    } catch (error) {
        console.error("Preview file error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to preview file"
        });
    }
};

export default {
    getCategories,
    uploadImaging,
    getImagingByPatient,
    getImagingById,
    previewFile,
    uploadMiddleware
};
