import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";
import User from "../models/User.js";
import mongoose from "mongoose";


const ALLOWED_TRANSITIONS = {
    BOOKED: ["CHECKED_IN", "CANCELLED", "NO_SHOW"],
    CHECKED_IN: ["IN_TREATMENT", "CANCELLED"],
    IN_TREATMENT: ["COMPLETED"],
    COMPLETED: [],
    CANCELLED: [],
    NO_SHOW: ["BOOKED"] 
};


const checkOverlap = async (doctorId, startTime, endTime, excludeId = null) => {
    const query = {
        doctorId,
        status: { $nin: ["CANCELLED", "NO_SHOW"] }, 
        $or: [
            {
            
                appointmentDate: { $lt: endTime },
 
            }
        ]
    };

    if (excludeId) {
        query._id = { $ne: excludeId };
    }

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


export const createAppointment = async (req, res) => {
    try {
        const { patientId, doctorId, appointmentDate, durationMinutes = 30, reason } = req.body;

        if (!patientId || !doctorId || !appointmentDate) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

       
        const patient = await Patient.findById(patientId);
        if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });

        const doctor = await User.findById(doctorId);
        if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

        
        const startTime = new Date(appointmentDate);
        const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

      
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


export const getAppointments = async (req, res) => {
    try {
        const { date, doctorId, patientId } = req.query;
     
        const { role: roleCode, userId } = req.user;

        if (!date) {
            return res.status(400).json({ success: false, message: "Date is required" });
        }

   
        const startOfDay = new Date(`${date}T00:00:00.000Z`);
        const endOfDay = new Date(`${date}T23:59:59.999Z`);

        const filter = {
            appointmentDate: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        };

  
        if (roleCode === "DOCTOR") {
            filter.doctorId = userId;
        }

       
        if (doctorId && roleCode !== "DOCTOR") {
            filter.doctorId = doctorId;
        }

        
        if (patientId) filter.patientId = patientId;
        if (req.query.status) filter.status = req.query.status;

       

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


export const updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const appointment = await Appointment.findById(id);
        if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });

        const currentStatus = appointment.status;

      
        if (currentStatus === status) {
            return res.json({ success: true, data: appointment });
        }

      
        if (!ALLOWED_TRANSITIONS[currentStatus]?.includes(status)) {
           
            return res.status(400).json({
                success: false,
                message: `Invalid status transition from ${currentStatus} to ${status}`
            });
        }

        appointment.status = status;
        await appointment.save();

        

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


export const updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { appointmentDate, durationMinutes, reason, doctorId } = req.body;

        const appointment = await Appointment.findById(id);
        if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });

      
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
