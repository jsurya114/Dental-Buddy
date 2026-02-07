import Procedure from "../models/Procedure.js";
import CaseSheet from "../models/CaseSheet.js";
import Patient from "../models/Patient.js";

// Allowed status transitions
const ALLOWED_TRANSITIONS = {
    PLANNED: ["IN_PROGRESS", "CANCELLED"],
    IN_PROGRESS: ["COMPLETED"],
    COMPLETED: [],
    CANCELLED: []
};

/**
 * Create a new planned procedure
 * POST /api/procedures
 */
export const createProcedure = async (req, res) => {
    try {
        const { patientId, caseSheetId, name, toothNumber, notes, isBillable } = req.body;

        // Validate required fields
        if (!patientId || !caseSheetId || !name) {
            return res.status(400).json({
                success: false,
                message: "patientId, caseSheetId, and name are required"
            });
        }

        // Verify case sheet exists and belongs to patient
        const caseSheet = await CaseSheet.findById(caseSheetId);
        if (!caseSheet) {
            return res.status(404).json({
                success: false,
                message: "Case sheet not found"
            });
        }

        if (caseSheet.patientId.toString() !== patientId) {
            return res.status(400).json({
                success: false,
                message: "Case sheet does not belong to this patient"
            });
        }

        const procedure = new Procedure({
            patientId,
            caseSheetId,
            name,
            toothNumber: toothNumber || "",
            notes: notes || "",
            isBillable: isBillable !== false, // Default to true
            status: "PLANNED",
            createdBy: req.user.userId
        });

        await procedure.save();

        res.status(201).json({
            success: true,
            message: "Procedure created successfully",
            data: procedure
        });
    } catch (error) {
        console.error("Create procedure error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create procedure"
        });
    }
};

/**
 * Get procedures by case sheet ID
 * GET /api/procedures?caseSheetId=...
 */
export const getProcedures = async (req, res) => {
    try {
        const { caseSheetId, patientId, status } = req.query;

        if (!caseSheetId && !patientId) {
            return res.status(400).json({
                success: false,
                message: "caseSheetId or patientId is required"
            });
        }

        const query = {};
        if (caseSheetId) query.caseSheetId = caseSheetId;
        if (patientId) query.patientId = patientId;
        if (status) query.status = status;

        const procedures = await Procedure.find(query)
            .populate("performedBy", "fullName loginId")
            .populate("createdBy", "fullName loginId")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: procedures
        });
    } catch (error) {
        console.error("Get procedures error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch procedures"
        });
    }
};

/**
 * Get a single procedure by ID
 * GET /api/procedures/:id
 */
export const getProcedureById = async (req, res) => {
    try {
        const { id } = req.params;

        const procedure = await Procedure.findById(id)
            .populate("performedBy", "fullName loginId")
            .populate("createdBy", "fullName loginId")
            .populate("patientId", "patientId fullName")
            .populate("caseSheetId");

        if (!procedure) {
            return res.status(404).json({
                success: false,
                message: "Procedure not found"
            });
        }

        res.json({
            success: true,
            data: procedure
        });
    } catch (error) {
        console.error("Get procedure by ID error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch procedure"
        });
    }
};

/**
 * Update procedure (only for non-locked procedures)
 * PATCH /api/procedures/:id
 */
export const updateProcedure = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, toothNumber, notes, isBillable } = req.body;

        const procedure = await Procedure.findById(id);
        if (!procedure) {
            return res.status(404).json({
                success: false,
                message: "Procedure not found"
            });
        }

        // Check if procedure is locked
        if (procedure.isLocked()) {
            return res.status(400).json({
                success: false,
                message: `Cannot edit a ${procedure.status} procedure`
            });
        }

        // Update allowed fields
        if (name !== undefined) procedure.name = name;
        if (toothNumber !== undefined) procedure.toothNumber = toothNumber;
        if (notes !== undefined) procedure.notes = notes;
        if (isBillable !== undefined) procedure.isBillable = isBillable;
        procedure.updatedBy = req.user.userId;

        await procedure.save();

        res.json({
            success: true,
            message: "Procedure updated successfully",
            data: procedure
        });
    } catch (error) {
        console.error("Update procedure error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update procedure"
        });
    }
};

/**
 * Update procedure status (with transition validation)
 * PATCH /api/procedures/:id/status
 */
export const updateProcedureStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status: newStatus } = req.body;

        if (!newStatus) {
            return res.status(400).json({
                success: false,
                message: "New status is required"
            });
        }

        const procedure = await Procedure.findById(id);
        if (!procedure) {
            return res.status(404).json({
                success: false,
                message: "Procedure not found"
            });
        }

        const currentStatus = procedure.status;

        // Validate transition
        if (!ALLOWED_TRANSITIONS[currentStatus]?.includes(newStatus)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status transition: ${currentStatus} → ${newStatus}. Allowed: ${ALLOWED_TRANSITIONS[currentStatus]?.join(", ") || "none"}`
            });
        }

        procedure.status = newStatus;
        procedure.updatedBy = req.user.userId;

        // If completing, set performer info
        if (newStatus === "COMPLETED") {
            procedure.performedBy = req.user.userId;
            procedure.performedAt = new Date();
        }

        await procedure.save();

        // Populate for response
        await procedure.populate("performedBy", "fullName loginId");

        res.json({
            success: true,
            message: `Procedure status updated to ${newStatus}`,
            data: procedure
        });
    } catch (error) {
        console.error("Update procedure status error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update procedure status"
        });
    }
};

/**
 * Complete a procedure (dedicated endpoint with COMPLETE permission)
 * PATCH /api/procedures/:id/complete
 */
export const completeProcedure = async (req, res) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;

        const procedure = await Procedure.findById(id);
        if (!procedure) {
            return res.status(404).json({
                success: false,
                message: "Procedure not found"
            });
        }

        // Only IN_PROGRESS procedures can be completed
        if (procedure.status !== "IN_PROGRESS") {
            return res.status(400).json({
                success: false,
                message: `Cannot complete a ${procedure.status} procedure. Procedure must be IN_PROGRESS.`
            });
        }

        procedure.status = "COMPLETED";
        procedure.performedBy = req.user.userId;
        procedure.performedAt = new Date();
        procedure.updatedBy = req.user.userId;
        if (notes) procedure.notes = notes;

        await procedure.save();
        await procedure.populate("performedBy", "fullName loginId");

        res.json({
            success: true,
            message: "Procedure completed successfully",
            data: procedure
        });
    } catch (error) {
        console.error("Complete procedure error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to complete procedure"
        });
    }
};

/**
 * Get procedures eligible for billing (COMPLETED + isBillable)
 * GET /api/billing/eligible-procedures?patientId=...
 */
export const getEligibleForBilling = async (req, res) => {
    try {
        const { patientId } = req.query;

        if (!patientId) {
            return res.status(400).json({
                success: false,
                message: "patientId is required"
            });
        }

        const procedures = await Procedure.find({
            patientId,
            status: "COMPLETED",
            isBillable: true
        })
            .populate("performedBy", "fullName loginId")
            .populate("caseSheetId", "_id")
            .sort({ performedAt: -1 });

        res.json({
            success: true,
            data: procedures,
            count: procedures.length
        });
    } catch (error) {
        console.error("Get eligible procedures error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch eligible procedures"
        });
    }
};

export default {
    createProcedure,
    getProcedures,
    getProcedureById,
    updateProcedure,
    updateProcedureStatus,
    completeProcedure,
    getEligibleForBilling
};
