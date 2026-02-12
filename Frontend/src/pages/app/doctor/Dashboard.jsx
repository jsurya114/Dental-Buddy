import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { usePermissions } from "../../../hooks/usePermission";
import {
    Users, Calendar, ClipboardList, Pill, Microscope,
    Image, Bot, UserPlus
} from "lucide-react";

/**
 * DoctorDashboard - Reskinned (Lighter Theme)
 */
const DoctorDashboard = () => {
    const user = useSelector((state) => state.auth.user || state.clinicAdmin?.admin);
    const { can } = usePermissions();
    const [greeting, setGreeting] = useState("Good morning");

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good morning");
        else if (hour < 18) setGreeting("Good afternoon");
        else setGreeting("Good evening");
    }, []);

    const menuItems = [
        {
            title: "My Patients",
            icon: Users,
            path: "/app/patients",
            resource: "PATIENT",
            action: "VIEW",
        },
        {
            title: "Appointments",
            icon: Calendar,
            path: "/app/appointments",
            resource: "APPOINTMENT",
            action: "VIEW",
        },
        {
            title: "Case Sheets",
            icon: ClipboardList,
            path: "/app/case-sheets",
            resource: "CASE_SHEET",
            action: "VIEW",
        },
        {
            title: "Prescriptions",
            icon: Pill,
            path: "/app/prescriptions",
            resource: "PRESCRIPTION",
            action: "VIEW",
        },
        {
            title: "Imaging & X-Rays",
            icon: Microscope,
            path: "/app/imaging",
            resource: "IMAGING",
            action: "VIEW",
        },
        {
            title: "Illustrations",
            icon: Image,
            path: "/app/illustrations",
            resource: "ILLUSTRATION",
            action: "VIEW",
        },
        {
            title: "AI Assistant",
            icon: Bot,
            path: "/app/assistant",
            resource: null,
            action: null,
        }
    ];

    const visibleMenuItems = menuItems.filter(item => {
        if (!item.resource) return true;
        return can(item.resource, item.action);
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header Section */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-sky-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
                            Welcome, <span className="text-sky-600">
                                Dr {user?.fullName || ""}
                            </span>
                        </h1>
                        <p className="text-gray-500 text-lg">
                            Ready for your clinical rounds today?
                        </p>
                    </div>
                    {/* Quick Action */}
                    <Link to="/app/patients/create" className="flex items-center gap-2 px-6 py-3 bg-sky-500 text-white rounded-xl shadow-md hover:bg-sky-600 transition-all font-bold">
                        <UserPlus className="w-5 h-5" /> New Patient
                    </Link>
                </div>
            </div>

            {/* Main Navigation Grid - Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {visibleMenuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className="group bg-sky-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center text-center h-48 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/40 to-transparent opacity-50"></div>

                        <div className="relative z-10 flex flex-col items-center w-full">
                            <div className="mb-3 text-sky-800 opacity-90 group-hover:scale-110 transition-transform duration-300">
                                <item.icon className="w-9 h-9" />
                            </div>

                            <h3 className="text-xl font-bold text-sky-950 mb-6">
                                {item.title}
                            </h3>

                            <div className="px-8 py-2 bg-sky-600 text-white text-sm font-bold rounded-full shadow-sm group-hover:bg-sky-700 transition-colors">
                                Go
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default DoctorDashboard;
