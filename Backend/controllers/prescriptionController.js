import Prescription from "../models/Prescription.js";
import CaseSheet from "../models/CaseSheet.js";

// Create Prescription
export const createPrescription = async (req, res) => {
    try {
        const { patientId, caseSheetId, medicines, notes } = req.body;
        const doctorId = req.user.userId;

        // Basic Validation
        if (!patientId || !caseSheetId || !medicines || medicines.length === 0) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Verify Case Sheet exists
        const caseSheet = await CaseSheet.findById(caseSheetId);
        if (!caseSheet) {
            return res.status(404).json({ success: false, message: "Case Sheet not found" });
        }

        const prescription = await Prescription.create({
            patientId,
            doctorId,
            caseSheetId,
            medicines,
            notes,
            createdBy: doctorId
        });

        res.status(201).json({ success: true, data: prescription });
    } catch (error) {
        console.error("Error creating prescription:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Get Prescriptions (by Patient or CaseSheet)
export const getPrescriptions = async (req, res) => {
    try {
        const { patientId, caseSheetId } = req.query;
        const filter = {};

        if (patientId) filter.patientId = patientId;
        if (caseSheetId) filter.caseSheetId = caseSheetId;

        const prescriptions = await Prescription.find(filter)
            .populate("doctorId", "fullName")
            .sort({ createdAt: -1 });

        res.json({ success: true, data: prescriptions });
    } catch (error) {
        console.error("Error fetching prescriptions:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Delete Prescription
export const deletePrescription = async (req, res) => {
    try {
        const { id } = req.params;
        const prescription = await Prescription.findById(id);

        if (!prescription) {
            return res.status(404).json({ success: false, message: "Prescription not found" });
        }

        // Only creator or Admin can delete
        if (prescription.doctorId.toString() !== req.user.userId && req.user.role !== "CLINIC_ADMIN") {
            return res.status(403).json({ success: false, message: "Not authorized to delete this prescription" });
        }

        await prescription.deleteOne();
        res.json({ success: true, message: "Prescription deleted" });
    } catch (error) {
        console.error("Error deleting prescription:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
