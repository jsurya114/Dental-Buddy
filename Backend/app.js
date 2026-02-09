import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "./middleware/mongoSanitize.js";
import connectDB from "./config/db.js";
import clinicAdminRoutes from "./routes/clinicAdminRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import adminRoleRoutes from "./routes/adminRoleRoutes.js";
import adminUserRoutes from "./routes/adminUserRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import caseSheetRoutes from "./routes/caseSheetRoutes.js";
import procedureRoutes from "./routes/procedureRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import imagingRoutes from "./routes/imagingRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import illustrationRoutes from "./routes/illustrationRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";


dotenv.config();

connectDB();

const app = express();

app.use(helmet());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100000,
    message: "Too many requests from this IP, please try again later."
});
app.use(limiter);

app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://dental-buddy.vercel.app"
    ],
    credentials: true
}));

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(mongoSanitize()); // Custom sanitizer

// Serve static files from uploads directory
app.use("/uploads", express.static("uploads"));


// Routes
app.use("/api/public", publicRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/clinic-admin", clinicAdminRoutes);
app.use("/api/admin/roles", adminRoleRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/case-sheets", caseSheetRoutes);
app.use("/api/procedures", procedureRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/imaging", imagingRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/illustrations", illustrationRoutes);
app.use("/api/search", searchRoutes);


// Health check route
app.get("/health", (req, res) => {
    res.json({ status: "OK", message: "Server is running" });
});

const PORT = process.env.PORT || 3125;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



