import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// Status transition rules
const ALLOWED_TRANSITIONS = {
    BOOKED: ["CHECKED_IN", "CANCELLED", "NO_SHOW"],
    CHECKED_IN: ["IN_TREATMENT", "CANCELLED"], // Allow cancel if mistake
    IN_TREATMENT: ["COMPLETED"],
    COMPLETED: [], // Terminal state
    CANCELLED: [], // Terminal state
    NO_SHOW: ["BOOKED"] // Allow re-booking? Or just terminal. Let's keep it terminal for this specific appointment ID.
};

/**
 * Check for overlapping appointments
 * Overlap if: (StartA < EndB) and (EndA > StartB)
 */
const checkOverlap = async (doctorId, startTime, endTime, excludeId = null) => {
    const query = {
        doctorId,
        status: { $nin: ["CANCELLED", "NO_SHOW"] }, // Ignore cancelled/no-show
        $or: [
            {
                // Existing appointment starts before new ends AND ends after new starts
                appointmentDate: { $lt: endTime },
                // We need to calculate end time of existing appointments in the query?
                // MongoDB doesn't store end time directly, so we can't easily query "end > start" without aggregation or storing end time.
                // Alternative: Fetch relevant appointments for the day and check in code.
                // Given the scale (Dental clinic), fetching one day's appointments for a doctor is cheap.
            }
        ]
    };

    if (excludeId) {
        query._id = { $ne: excludeId };
    }

    // Optimization: Only fetch appointments for the same day (with some buffer for midnight crossovers? Dental clinics usually day-only)
    const dayStart = new Date(startTime);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(startTime);
    dayEnd.setHours(23, 59, 59, 999);

    query.appointmentDate = { $gte: dayStart, $lte: dayEnd };

    const appointments = await Appointment.find(query);

    return appointments.some(apt => {
        const aptStart = new Date(apt.appointmentDate);
        const aptEnd = new Date(aptStart.getTime() + apt.durationMinutes * 60000);

        return (startTime < aptEnd && endTime > aptStart);
    });
};

/**
 * Create Appointment
 * POST /api/appointments
 */
export const createAppointment = async (req, res) => {
    try {
        const { patientId, doctorId, appointmentDate, durationMinutes = 30, reason } = req.body;

        // Validations
        if (!patientId || !doctorId || !appointmentDate) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Validate Patient and Doctor exist
        const patient = await Patient.findById(patientId);
        if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });

        const doctor = await User.findById(doctorId);
        if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

        // Calculate time window
        const startTime = new Date(appointmentDate);
        const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

        // Check availability
        const isOverlap = await checkOverlap(doctorId, startTime, endTime);
        if (isOverlap) {
            return res.status(409).json({ success: false, message: "Doctor is unavailable at this time (Overlapping appointment)" });
        }

        const appointment = new Appointment({
            patientId,
            doctorId,
            appointmentDate: startTime,
            durationMinutes,
            reason,
            status: "BOOKED",
            createdBy: req.user.id
        });

        await appointment.save();

        res.status(201).json({
            success: true,
            message: "Appointment booked successfully",
            data: appointment
        });

    } catch (error) {
        console.error("Create appointment error:", error);
        res.status(500).json({ success: false, message: "Failed to create appointment" });
    }
};

/**
 * List Appointments
 * GET /api/appointments?date=YYYY-MM-DD&doctorId=...
 */
export const getAppointments = async (req, res) => {
    try {
        const { date, doctorId, patientId } = req.query;
        // Map req.user.role to roleCode to match the logic
        const { role: roleCode, userId } = req.user;

        if (!date) {
            return res.status(400).json({ success: false, message: "Date is required" });
        }

        // 🔑 DATE RANGE (CRITICAL FIX)
        // Ensure strictly UTC day range matching
        const startOfDay = new Date(`${date}T00:00:00.000Z`);
        const endOfDay = new Date(`${date}T23:59:59.999Z`);

        const filter = {
            appointmentDate: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        };

        // � ROLE-AWARE FILTERING
        if (roleCode === "DOCTOR") {
            filter.doctorId = userId;
        }

        // Optional doctor filter (Admin / Receptionist only)
        if (doctorId && roleCode !== "DOCTOR") {
            filter.doctorId = doctorId;
        }

        // Other filters
        if (patientId) filter.patientId = patientId;
        if (req.query.status) filter.status = req.query.status;

        // 🔑 Sort by createdAt descending (Newest Added First) as per requirement

        const appointments = await Appointment.find(filter)
            .populate("patientId", "fullName phone")
            .populate("doctorId", "fullName")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: appointments
        });
    } catch (error) {
        console.error("Get appointments error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch appointments" });
    }
};

/**
 * Update Appointment Status
 * PATCH /api/appointments/:id/status
 */
export const updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const appointment = await Appointment.findById(id);
        if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });

        const currentStatus = appointment.status;

        // Allow same status (idempotent)
        if (currentStatus === status) {
            return res.json({ success: true, data: appointment });
        }

        // Validate transition
        if (!ALLOWED_TRANSITIONS[currentStatus]?.includes(status)) {
            // Special case: Admin might need to force changes? For now, stick to rules.
            return res.status(400).json({
                success: false,
                message: `Invalid status transition from ${currentStatus} to ${status}`
            });
        }

        appointment.status = status;
        await appointment.save();

        // TODO: Trigger integrations (e.g., create Case Sheet on CHECKED_IN or IN_TREATMENT)

        res.json({
            success: true,
            message: `Appointment status updated to ${status}`,
            data: appointment
        });

    } catch (error) {
        console.error("Update status error:", error);
        res.status(500).json({ success: false, message: "Failed to update status" });
    }
};

/**
 * Update Appointment Details (Reschedule/Edit)
 * PUT /api/appointments/:id
 */
export const updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { appointmentDate, durationMinutes, reason, doctorId } = req.body;

        const appointment = await Appointment.findById(id);
        if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });

        // If rescheduling or changing doctor, check overlap
        if (appointmentDate || durationMinutes || (doctorId && doctorId !== appointment.doctorId.toString())) {

            const newDocId = doctorId || appointment.doctorId;
            const newDate = appointmentDate ? new Date(appointmentDate) : appointment.appointmentDate;
            const newDuration = durationMinutes || appointment.durationMinutes;

            const endTime = new Date(new Date(newDate).getTime() + newDuration * 60000);

            const isOverlap = await checkOverlap(newDocId, new Date(newDate), endTime, id);
            if (isOverlap) {
                return res.status(409).json({ success: false, message: "Doctor is unavailable at this new time" });
            }
        }

        if (appointmentDate) appointment.appointmentDate = appointmentDate;
        if (durationMinutes) appointment.durationMinutes = durationMinutes;
        if (reason) appointment.reason = reason;
        if (doctorId) appointment.doctorId = doctorId;

        await appointment.save();

        res.json({
            success: true,
            message: "Appointment updated successfully",
            data: appointment
        });

    } catch (error) {
        console.error("Update appointment error:", error);
        res.status(500).json({ success: false, message: "Failed to update appointment" });
    }
};

/**
 * Cancel Appointment
 * PATCH /api/appointments/:id/cancel
 */
export const cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await Appointment.findById(id);

        if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });

        if (["COMPLETED", "CANCELLED"].includes(appointment.status)) {
            return res.status(400).json({ success: false, message: "Cannot cancel a completed or already cancelled appointment" });
        }

        appointment.status = "CANCELLED";
        await appointment.save();

        res.json({
            success: true,
            message: "Appointment cancelled",
            data: appointment
        });

    } catch (error) {
        console.error("Cancel appointment error:", error);
        res.status(500).json({ success: false, message: "Failed to cancel appointment" });
    }
};
