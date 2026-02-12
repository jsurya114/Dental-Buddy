import Patient from "../models/Patient.js";
import mongoose from "mongoose";


export const createPatient = async (req, res) => {
    try {
        const {
            fullName,
            gender,
            age,
            dob,
            phone,
            email,
            address,
            occupation,
            emergencyContact
        } = req.body;


        if (!fullName || !phone) {
            return res.status(400).json({
                success: false,
                message: "Full name and phone are required"
            });
        }


        const isDuplicate = await Patient.checkDuplicate(fullName, phone);
        if (isDuplicate) {
            return res.status(409).json({
                success: false,
                message: "A patient with the same name and phone already exists"
            });
        }

        const patientId = await Patient.generatePatientId();


        const patient = new Patient({
            patientId,
            fullName,
            gender,
            age,
            dob,
            phone,
            email,
            address,
            occupation,
            emergencyContact,
            createdBy: req.user.userId
        });

        await patient.save();

        res.status(201).json({
            success: true,
            message: "Patient registered successfully",
            data: patient
        });
    } catch (error) {
        console.error("Create patient error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to register patient"
        });
    }
};


export const listPatients = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || "";
        const view = req.query.view || "all";
        const skip = (page - 1) * limit;

        const query = {};

        // Filter Logic
        if (view === "active") {
            query.isActive = true;
        } else if (view === "new") {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            query.createdAt = { $gte: thirtyDaysAgo };
            query.isActive = true;
        } else {
            // view === 'all' - Show all patients (active & inactive)
            // If you want 'all' to be only active, uncomment next line:
            // query.isActive = true; 
        }

        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
                { patientId: { $regex: search, $options: "i" } }
            ];
        }


        const total = await Patient.countDocuments(query);


        const patients = await Patient.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select("patientId fullName phone age gender createdAt");

        res.json({
            success: true,
            data: patients,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("List patients error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch patients"
        });
    }
};


export const getPatient = async (req, res) => {
    try {
        const { id } = req.params;

        const patient = await Patient.findById(id)
            .populate("createdBy", "fullName loginId")
            .populate("updatedBy", "fullName loginId");

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        res.json({
            success: true,
            data: patient
        });
    } catch (error) {
        console.error("Get patient error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch patient"
        });
    }
};


export const updatePatient = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            fullName,
            gender,
            age,
            dob,
            phone,
            email,
            address,
            occupation,
            emergencyContact
        } = req.body;


        const patient = await Patient.findById(id);
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }


        if (!fullName || !phone) {
            return res.status(400).json({
                success: false,
                message: "Full name and phone are required"
            });
        }


        const isDuplicate = await Patient.checkDuplicate(fullName, phone, id);
        if (isDuplicate) {
            return res.status(409).json({
                success: false,
                message: "A patient with the same name and phone already exists"
            });
        }


        patient.fullName = fullName;
        patient.gender = gender;
        patient.age = age;
        patient.dob = dob;
        patient.phone = phone;
        patient.email = email;
        patient.address = address;
        patient.occupation = occupation;
        patient.emergencyContact = emergencyContact;
        patient.updatedBy = req.user.userId;

        await patient.save();

        res.json({
            success: true,
            message: "Patient updated successfully",
            data: patient
        });
    } catch (error) {
        console.error("Update patient error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update patient"
        });
    }
};


export const deactivatePatient = async (req, res) => {
    try {
        const { id } = req.params;

        const patient = await Patient.findById(id);
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        patient.isActive = false;
        patient.updatedBy = req.user.userId;
        await patient.save();

        res.json({
            success: true,
            message: "Patient deactivated successfully"
        });
    } catch (error) {
        console.error("Deactivate patient error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to deactivate patient"
        });
    }
};

/**
 * Handle Tooth Chart
 */
export const getToothChart = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id).select("toothChart");
        if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });

        res.json({
            success: true,
            toothChart: patient.toothChart || []
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch tooth chart" });
    }
};

export const updateToothStatus = async (req, res) => {
    try {
        const { id, toothNumber } = req.params;
        const { status, notes } = req.body;

        const patient = await Patient.findById(id);
        if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });

        // Find existing tooth or create new record
        const toothIndex = patient.toothChart.findIndex(t => t.toothNumber === toothNumber);

        if (toothIndex > -1) {
            // Update existing
            patient.toothChart[toothIndex].status = status;
            patient.toothChart[toothIndex].notes = notes;
            patient.toothChart[toothIndex].updatedAt = new Date();
        } else {
            // Add new
            patient.toothChart.push({
                toothNumber,
                status,
                notes,
                updatedAt: new Date()
            });
        }

        await patient.save();

        res.json({
            success: true,
            message: `Tooth ${toothNumber} updated successfully`,
            toothChart: patient.toothChart
        });
    } catch (error) {
        console.error("Update tooth status error:", error);
        res.status(500).json({ success: false, message: "Failed to update tooth status" });
    }
};

export default {
    createPatient,
    listPatients,
    getPatient,
    updatePatient,
    deactivatePatient,
    getToothChart,
    updateToothStatus
};
