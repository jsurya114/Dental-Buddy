import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

// Dashboard components
import AdminDashboard from "../pages/app/admin/Dashboard";
import DoctorDashboard from "../pages/app/doctor/Dashboard";
import ReceptionDashboard from "../pages/app/reception/Dashboard";
import BillingDashboard from "../pages/app/billing/Dashboard";
import CommonDashboard from "../pages/app/common/Dashboard";

/**
 * Role to Dashboard Component mapping
 */
const dashboardComponents = {
    // Admin
    CLINIC_ADMIN: AdminDashboard,

    // Doctor-type roles
    DOCTOR: DoctorDashboard,
    INTERN_DOCTOR: DoctorDashboard,
    CONSULTANT: DoctorDashboard,
    SURGEON: DoctorDashboard,
    DENTAL_SURGEON: DoctorDashboard,

    // Front desk
    RECEPTIONIST: ReceptionDashboard,
    FRONT_DESK: ReceptionDashboard,

    // Finance
    BILLING: BillingDashboard,
    ACCOUNTANT: BillingDashboard,

    // Assistants
    ASSISTANT: ReceptionDashboard,
    NURSE: ReceptionDashboard
};

/**
 * DashboardRouter - Routes to the correct dashboard based on user role
 * 
 * This component determines which dashboard to show based on the 
 * authenticated user's role code.
 */
const DashboardRouter = () => {
    // Get user from either auth slice
    const authUser = useSelector((state) => state.auth.user);
    const clinicAdmin = useSelector((state) => state.clinicAdmin?.admin);
    const user = authUser || clinicAdmin;

    // No user - redirect to login
    if (!user) {
        return <Navigate to="/" replace />;
    }

    // Get role code
    const roleCode = (user.role || user.roleCode || "").toUpperCase();

    // Get the appropriate dashboard component
    const DashboardComponent = dashboardComponents[roleCode] || CommonDashboard;

    return <DashboardComponent />;
};

export default DashboardRouter;
