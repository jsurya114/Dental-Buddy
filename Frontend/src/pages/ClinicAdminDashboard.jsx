import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout as logoutClinicAdmin } from "../redux/clinicAdminSlice";
import { logout as logoutAuth } from "../redux/authSlice";
import {
    Users,
    Calendar,
    Bot,
    Receipt,
    Image,
    Microscope,
    Shield,
    UserCog,
    BarChart3,
    LogOut,
    ArrowRight
} from "lucide-react";

const ClinicAdminDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Get user from both slices for backward compatibility
    const authState = useSelector((state) => state.auth);
    const clinicAdminState = useSelector((state) => state.clinicAdmin);

    // Use whichever slice has the user data
    const admin = authState.user || clinicAdminState.admin;

    const handleLogout = () => {
        dispatch(logoutAuth());
        dispatch(logoutClinicAdmin());
        navigate("/");
    };

    const dashboardCards = [
        {
            title: "Patient Records",
            icon: Users,
            path: "/app/patients",
            description: "Manage patient files & history"
        },
        {
            title: "Appointments",
            icon: Calendar,
            path: "/app/appointments",
            description: "Schedule & manage visits"
        },
        {
            title: "Dental Assistant",
            icon: Bot,
            path: "/app/assistant",
            description: "AI-powered clinical support"
        },
        {
            title: "Finance & Billing",
            icon: Receipt,
            path: "/app/billing",
            description: "Invoices, payments & expenses"
        },
        {
            title: "Manage Roles",
            icon: Shield,
            path: "/clinic-admin/roles",
            description: "Configure system access levels"
        },
        {
            title: "Manage Users",
            icon: UserCog,
            path: "/clinic-admin/users",
            description: "Manage clinic staff accounts"
        },
        {
            title: "Illustrations",
            icon: Image,
            path: "/app/illustrations",
            description: "Patient education materials"
        },
        {
            title: "Imaging",
            icon: Microscope,
            path: "/app/imaging",
            description: "X-rays and scans"
        },
        {
            title: "Analytics & Reports",
            icon: BarChart3,
            path: "/app/reports",
            description: "Clinical & financial insights"
        }
    ];

    return (
        <div
            className="min-h-screen relative"
            style={{
                backgroundColor: "#f3f6f9",
                backgroundImage: "linear-gradient(to bottom right, #f0f9ff, #ffffff)"
            }}
        >
            {/* Header Section */}
            <div className="bg-white/80 backdrop-blur-md border-b border-sky-100 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-center sm:text-left">
                        <h1 className="text-2xl sm:text-3xl font-black text-sky-950 tracking-tight">
                            Well Done, {admin?.fullName?.split(' ')[0] || "Admin"}
                        </h1>
                        <p className="text-sky-600 font-bold uppercase tracking-widest text-[10px] sm:text-xs">
                            Clinic Management Command Center
                        </p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 group px-5 py-2.5 bg-sky-50 text-sky-600 hover:bg-rose-50 hover:text-rose-600 rounded-2xl transition-all border border-sky-100 hover:border-rose-100 shadow-sm font-bold text-sm"
                    >
                        <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>

            {/* Dashboard Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {dashboardCards.map((card, index) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={index}
                                className="group relative rounded-3xl shadow-xl shadow-sky-900/5 hover:shadow-2xl hover:shadow-sky-600/10 transition-all duration-500 hover:-translate-y-2 overflow-hidden border border-white/50"
                            >
                                {/* Card Background Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-cyan-500 group-hover:from-sky-500 group-hover:to-cyan-600 transition-colors"></div>

                                {/* Content */}
                                <div className="relative z-10 flex flex-col items-center text-center p-8 h-full">
                                    {/* Icon */}
                                    <div className="mb-6 text-white p-4 bg-white/20 rounded-2xl backdrop-blur-md shadow-inner group-hover:scale-110 transition-transform">
                                        <Icon className="w-8 h-8 sm:w-10 sm:h-10" />
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-xl sm:text-2xl font-black text-white mb-4 tracking-tight drop-shadow-sm">
                                        {card.title}
                                    </h3>

                                    {/* Spacer */}
                                    <div className="flex-grow min-h-[1rem]"></div>

                                    {/* Go Button */}
                                    <button
                                        onClick={() => navigate(card.path)}
                                        className="w-full sm:w-auto bg-white text-sky-600 rounded-2xl px-10 py-3 shadow-lg hover:shadow-xl hover:bg-sky-50 transition-all font-black text-sm uppercase tracking-widest active:scale-95"
                                    >
                                        Access
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* Footer */}
            <footer className="max-w-7xl mx-auto px-6 py-6 text-center text-gray-400 text-xs">
                © 2026 Dental Buddy System. All rights reserved.
            </footer>
        </div>
    );
};

export default ClinicAdminDashboard;
