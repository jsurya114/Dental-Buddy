import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { usePermissions } from "../../../hooks/usePermission";

/**
 * AdminDashboard - Dashboard content for CLINIC_ADMIN role
 * 
 * Header and logout are handled by AppShell.
 * This component only renders the dashboard content.
 */
const AdminDashboard = () => {
    const user = useSelector((state) => state.auth.user || state.clinicAdmin?.admin);
    const { can } = usePermissions();

    const menuItems = [
        {
            title: "Manage Roles",
            description: "Configure and manage user roles and permissions",
            icon: "🛡️",
            path: "/app/roles",
            resource: "ROLE_MANAGEMENT",
            action: "VIEW",

        },
        {
            title: "Manage Users",
            description: "Add, edit, and manage clinic staff members",
            icon: "👥",
            path: "/app/users",
            resource: "USER_MANAGEMENT",
            action: "VIEW",

        },
        {
            title: "Patients",
            description: "View and manage patient records",
            icon: "🏥",
            path: "/app/patients",
            resource: "PATIENT",
            action: "VIEW",

        },
        {
            title: "Appointments",
            description: "Schedule and manage appointments",
            icon: "📅",
            path: "/app/appointments",
            resource: "APPOINTMENT",
            action: "VIEW",

        },
        {
            title: "Billing",
            description: "Invoices and payment management",
            icon: "💰",
            path: "/app/billing",
            resource: "BILLING",
            action: "VIEW",

        },
        {
            title: "Illustrations",
            description: "Educational videos and images",
            icon: "🎨",
            path: "/app/illustrations",
            resource: "ILLUSTRATION",
            action: "VIEW",
        },
        {
            title: "Reports",
            description: "Analytics and reporting",
            icon: "📊",
            path: "/app/reports",
            resource: "REPORTS",
            action: "VIEW",

        },
        {
            title: "Dental Assistant",
            description: "AI-powered search for dental info",
            icon: "🤖",
            path: "/app/assistant",
            resource: null,
            action: null,
            color: "from-indigo-500 to-blue-600"
        }
    ];

    // Filter menu items based on permissions
    const visibleMenuItems = menuItems.filter(item => {
        if (!item.resource) return true;
        return can(item.resource, item.action);
    });

    return (
        <div>
            {/* Welcome Section */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800">
                    Admin Dashboard
                </h2>
                <p className="text-gray-500 mt-1">Manage your clinic from here</p>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleMenuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className="group bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                    >
                        <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                            <span className="text-2xl text-white">{item.icon}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-500">{item.description}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;
