import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { createPrescription, getPrescriptions, deletePrescription } from "../controllers/prescriptionController.js";

const router = express.Router();

router.use(protect); // All routes require login

router.post("/", authorize("DOCTOR"), createPrescription); // Only Doctors can prescribe
router.get("/", getPrescriptions); // All authenticated users can view (could refine to DOCTOR/ADMIN)
router.delete("/:id", authorize("DOCTOR", "CLINIC_ADMIN"), deletePrescription);

export default router;
