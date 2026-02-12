import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { usePermissions } from "../../../hooks/usePermission";
import {
    Users, Calendar, CreditCard, UserPlus, CalendarPlus,
    Search
} from "lucide-react";

/**
 * ReceptionDashboard - Reskinned (Lighter Theme)
 */
const ReceptionDashboard = () => {
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
            title: "Patient Records",
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
            title: "Billing & Invoices",
            icon: CreditCard,
            path: "/app/billing",
            resource: "BILLING",
            action: "VIEW",
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
                            {greeting}, <span className="text-sky-600">{user?.fullName?.split(" ")[0] || "Reception"}</span>
                        </h1>
                        <p className="text-gray-500 text-lg">
                            Front desk control panel.
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Actions Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {can("PATIENT", "CREATE") && (
                    <Link to="/app/patients" className="flex items-center justify-center gap-2 px-6 py-4 bg-sky-500 text-white rounded-xl shadow-md hover:bg-sky-600 transition-all font-bold group">
                        <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" /> New Patient Registration
                    </Link>
                )}
                {can("APPOINTMENT", "CREATE") && (
                    <Link to="/app/appointments" className="flex items-center justify-center gap-2 px-6 py-4 bg-teal-500 text-white rounded-xl shadow-md hover:bg-teal-600 transition-all font-bold group">
                        <CalendarPlus className="w-5 h-5 group-hover:scale-110 transition-transform" /> Book New Appointment
                    </Link>
                )}
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

                {/* Patient Lookup Card - Styled to match */}
                <div className="group bg-sky-200 rounded-2xl p-6 shadow-sm transition-all duration-300 flex flex-col items-center justify-center h-48 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/40 to-transparent opacity-50"></div>

                    <div className="relative z-10 flex flex-col items-center w-full px-4">
                        <div className="mb-2 text-sky-800 opacity-90">
                            <Search className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-sky-950 mb-3">
                            Patient Lookup
                        </h3>
                        <div className="relative w-full max-w-xs">
                            <input
                                type="text"
                                placeholder="Search Name..."
                                className="w-full bg-white border-2 border-sky-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-sky-500 text-center placeholder-gray-400 text-gray-900 shadow-sm"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReceptionDashboard;
