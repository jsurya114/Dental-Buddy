import express from "express";
import {
    createAppointment,
    getAppointments,
    updateAppointmentStatus,
    updateAppointment,
    cancelAppointment,
    deleteAppointment
} from "../controllers/appointmentController.js";
import auth from "../middleware/authMiddleware.js";
import { can } from "../middleware/permissionMiddleware.js";

const router = express.Router();

// Create Appointment - Check availability & create
router.post(
    "/",
    auth,
    can("APPOINTMENT", "CREATE"),
    createAppointment
);

// List Appointments - Filter by date/doctor
router.get(
    "/",
    auth,
    can("APPOINTMENT", "VIEW"),
    getAppointments
);

// Update Status - Check transition logic
router.patch(
    "/:id/status",
    auth,
    can("APPOINTMENT", "EDIT"),
    updateAppointmentStatus
);

// Update Details - Reschedule
router.put(
    "/:id",
    auth,
    can("APPOINTMENT", "EDIT"),
    updateAppointment
);

// Cancel Appointment
router.patch(
    "/:id/cancel",
    auth,
    can("APPOINTMENT", "DELETE"),
    cancelAppointment
);

// Delete Appointment - Permanent
router.delete(
    "/:id",
    auth,
    can("APPOINTMENT", "DELETE"),
    deleteAppointment
);

export default router;
