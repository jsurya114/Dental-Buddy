import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { usePermissions } from "../../../hooks/usePermission";

/**
 * ReceptionDashboard - Dashboard content for reception/front desk roles
 * 
 * Header and logout are handled by AppShell.
 * This component only renders the dashboard content.
 */
const ReceptionDashboard = () => {
    const user = useSelector((state) => state.auth.user || state.clinicAdmin?.admin);
    const { can } = usePermissions();

    const menuItems = [
        {
            title: "Patient Registration",
            description: "Register new patients",
            icon: "📝",
            path: "/app/patients",
            resource: "PATIENT",
            action: "CREATE",
            color: "from-emerald-500 to-teal-600"
        },
        {
            title: "Patients",
            description: "View patient records",
            icon: "🏥",
            path: "/app/patients",
            resource: "PATIENT",
            action: "VIEW",
            color: "from-blue-500 to-cyan-600"
        },
        {
            title: "Appointments",
            description: "Schedule and manage appointments",
            icon: "📅",
            path: "/app/appointments",
            resource: "APPOINTMENT",
            action: "VIEW",
            color: "from-violet-500 to-purple-600"
        },
        {
            title: "Billing",
            description: "Process payments and invoices",
            icon: "💰",
            path: "/app/billing",
            resource: "BILLING",
            action: "VIEW",
            color: "from-orange-500 to-amber-600"
        }
    ];

    // Filter menu items based on permissions
    const visibleMenuItems = menuItems.filter(item => can(item.resource, item.action));

    return (
        <div>
            {/* Welcome Section */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800">
                    Reception Desk
                </h2>
                <p className="text-gray-500 mt-1">Front desk operations</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                {can("PATIENT", "CREATE") && (
                    <Link
                        to="/app/patients"
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl p-4 flex items-center gap-3 hover:opacity-90 transition-opacity"
                    >
                        <span className="text-2xl">➕</span>
                        <span className="font-semibold">New Patient</span>
                    </Link>
                )}
                {can("APPOINTMENT", "CREATE") && (
                    <Link
                        to="/app/appointments"
                        className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl p-4 flex items-center gap-3 hover:opacity-90 transition-opacity"
                    >
                        <span className="text-2xl">📅</span>
                        <span className="font-semibold">New Appointment</span>
                    </Link>
                )}
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {visibleMenuItems.map((item) => (
                    <Link
                        key={item.path + item.title}
                        to={item.path}
                        className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300"
                    >
                        <div className={`w-14 h-14 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                            <span className="text-2xl">{item.icon}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-500">{item.description}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default ReceptionDashboard;
