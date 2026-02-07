import CaseSheet from "../models/CaseSheet.js";
import Patient from "../models/Patient.js";
import Role from "../models/Role.js";

// Section to Permission Mapping
const sectionPermissionMap = {
    "personal-history": { module: "CASE_PERSONAL", field: "personalHistory" },
    "medical-history": { module: "CASE_MEDICAL", field: "medicalHistory" },
    "dental-examination": { module: "CASE_EXAM", field: "dentalExamination" },
    "diagnosis": { module: "CASE_DIAGNOSIS", field: "diagnosis" },
    "treatment-plan": { module: "CASE_TREATMENT", field: "treatmentPlan" },
    "procedures": { module: "CASE_PROCEDURE", field: "procedures" },
    "notes": { module: "CASE_NOTES", field: "notes" }
};

// Helper: Check if user has permission for a section
const hasPermission = async (roleCode, module, action) => {
    if (roleCode === "CLINIC_ADMIN") return true;

    const role = await Role.findOne({ code: roleCode, isActive: true });
    if (!role) return false;

    return role.permissions?.[module]?.includes(action) || false;
};

// Helper: Filter case sheet sections based on user permissions
const filterSectionsByPermission = async (caseSheet, roleCode) => {
    if (roleCode === "CLINIC_ADMIN") {
        return caseSheet;
    }

    const role = await Role.findOne({ code: roleCode, isActive: true });
    const permissions = role?.permissions || {};

    const filtered = {
        _id: caseSheet._id,
        patientId: caseSheet.patientId,
        createdAt: caseSheet.createdAt,
        updatedAt: caseSheet.updatedAt,
        createdBy: caseSheet.createdBy
    };

    // Add each section only if user has VIEW permission
    if (permissions.CASE_PERSONAL?.includes("VIEW")) {
        filtered.personalHistory = caseSheet.personalHistory;
    }
    if (permissions.CASE_MEDICAL?.includes("VIEW")) {
        filtered.medicalHistory = caseSheet.medicalHistory;
    }
    if (permissions.CASE_EXAM?.includes("VIEW")) {
        filtered.dentalExamination = caseSheet.dentalExamination;
    }
    if (permissions.CASE_DIAGNOSIS?.includes("VIEW")) {
        filtered.diagnosis = caseSheet.diagnosis;
    }
    if (permissions.CASE_TREATMENT?.includes("VIEW")) {
        filtered.treatmentPlan = caseSheet.treatmentPlan;
    }
    if (permissions.CASE_PROCEDURE?.includes("VIEW")) {
        filtered.procedures = caseSheet.procedures;
    }
    if (permissions.CASE_NOTES?.includes("VIEW")) {
        filtered.notes = caseSheet.notes;
    }

    return filtered;
};

// Create new case sheet for a patient
export const createCaseSheet = async (req, res) => {
    try {
        const { patientId, personalHistory } = req.body;

        // Validate patient exists
        const patient = await Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        // Check if case sheet already exists for this patient
        const existing = await CaseSheet.findOne({ patientId });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: "Case sheet already exists for this patient",
                data: { caseSheetId: existing._id }
            });
        }

        const caseSheet = new CaseSheet({
            patientId,
            personalHistory: personalHistory || {},
            createdBy: req.user.userId
        });

        await caseSheet.save();

        res.status(201).json({
            success: true,
            message: "Case sheet created successfully",
            data: caseSheet
        });
    } catch (error) {
        console.error("Create case sheet error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create case sheet"
        });
    }
};

// Get case sheet by ID (with section filtering)
export const getCaseSheet = async (req, res) => {
    try {
        const { id } = req.params;

        const caseSheet = await CaseSheet.findById(id)
            .populate("patientId", "patientId fullName phone age gender")
            .populate("createdBy", "fullName loginId")
            .populate("procedures.performedBy", "fullName loginId");

        if (!caseSheet) {
            return res.status(404).json({
                success: false,
                message: "Case sheet not found"
            });
        }

        // Filter sections based on user permissions
        const filteredCaseSheet = await filterSectionsByPermission(
            caseSheet.toObject(),
            req.user.role
        );

        res.json({
            success: true,
            data: filteredCaseSheet
        });
    } catch (error) {
        console.error("Get case sheet error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch case sheet"
        });
    }
};

// Get case sheet by patient ID
export const getCaseSheetByPatient = async (req, res) => {
    try {
        const { patientId } = req.params;

        const caseSheet = await CaseSheet.findOne({ patientId })
            .populate("patientId", "patientId fullName phone age gender")
            .populate("createdBy", "fullName loginId")
            .populate("procedures.performedBy", "fullName loginId");

        if (!caseSheet) {
            return res.status(404).json({
                success: false,
                message: "Case sheet not found for this patient"
            });
        }

        // Filter sections based on user permissions
        const filteredCaseSheet = await filterSectionsByPermission(
            caseSheet.toObject(),
            req.user.role
        );

        res.json({
            success: true,
            data: filteredCaseSheet
        });
    } catch (error) {
        console.error("Get case sheet by patient error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch case sheet"
        });
    }
};

// Update a specific section of the case sheet
export const updateSection = async (req, res) => {
    try {
        const { id, sectionName } = req.params;
        const sectionData = req.body;

        // Validate section name
        const sectionConfig = sectionPermissionMap[sectionName];
        if (!sectionConfig) {
            return res.status(400).json({
                success: false,
                message: `Invalid section: ${sectionName}`
            });
        }

        // Check permission for this section
        const canEdit = await hasPermission(req.user.role, sectionConfig.module, "EDIT");
        if (!canEdit) {
            return res.status(403).json({
                success: false,
                message: `Access denied. You don't have EDIT permission for ${sectionName}`
            });
        }

        // Find and update
        const caseSheet = await CaseSheet.findById(id);
        if (!caseSheet) {
            return res.status(404).json({
                success: false,
                message: "Case sheet not found"
            });
        }

        // Update the specific section
        caseSheet[sectionConfig.field] = sectionData;
        caseSheet.updatedBy = req.user.userId;
        await caseSheet.save();

        res.json({
            success: true,
            message: `${sectionName} updated successfully`,
            data: {
                [sectionConfig.field]: caseSheet[sectionConfig.field]
            }
        });
    } catch (error) {
        console.error("Update section error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update section"
        });
    }
};

// Add item to treatment plan
export const addTreatmentPlanItem = async (req, res) => {
    try {
        const { id } = req.params;
        const treatmentItem = req.body;

        const caseSheet = await CaseSheet.findById(id);
        if (!caseSheet) {
            return res.status(404).json({
                success: false,
                message: "Case sheet not found"
            });
        }

        caseSheet.treatmentPlan.push(treatmentItem);
        caseSheet.updatedBy = req.user.userId;
        await caseSheet.save();

        res.json({
            success: true,
            message: "Treatment plan item added",
            data: caseSheet.treatmentPlan
        });
    } catch (error) {
        console.error("Add treatment plan error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add treatment plan item"
        });
    }
};

// Add procedure record
export const addProcedure = async (req, res) => {
    try {
        const { id } = req.params;
        const procedureData = req.body;

        const caseSheet = await CaseSheet.findById(id);
        if (!caseSheet) {
            return res.status(404).json({
                success: false,
                message: "Case sheet not found"
            });
        }

        caseSheet.procedures.push({
            ...procedureData,
            performedBy: req.user.userId,
            date: procedureData.date || new Date()
        });
        caseSheet.updatedBy = req.user.userId;
        await caseSheet.save();

        res.json({
            success: true,
            message: "Procedure added successfully",
            data: caseSheet.procedures
        });
    } catch (error) {
        console.error("Add procedure error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add procedure"
        });
    }
};

// Get user's section permissions for a case sheet
export const getSectionPermissions = async (req, res) => {
    try {
        const roleCode = req.user.role;

        if (roleCode === "CLINIC_ADMIN") {
            // Admin has all permissions
            const allPermissions = {};
            Object.keys(sectionPermissionMap).forEach(section => {
                allPermissions[section] = { view: true, edit: true, create: true };
            });
            return res.json({ success: true, data: allPermissions });
        }

        const role = await Role.findOne({ code: roleCode, isActive: true });
        const permissions = role?.permissions || {};

        const sectionPermissions = {};
        Object.entries(sectionPermissionMap).forEach(([section, config]) => {
            const modulePerms = permissions[config.module] || [];
            sectionPermissions[section] = {
                view: modulePerms.includes("VIEW"),
                edit: modulePerms.includes("EDIT"),
                create: modulePerms.includes("CREATE")
            };
        });

        res.json({
            success: true,
            data: sectionPermissions
        });
    } catch (error) {
        console.error("Get section permissions error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get section permissions"
        });
    }
};

export default {
    createCaseSheet,
    getCaseSheet,
    getCaseSheetByPatient,
    updateSection,
    addTreatmentPlanItem,
    addProcedure,
    getSectionPermissions
};
