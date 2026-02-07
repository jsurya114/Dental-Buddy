import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { usePermissions } from "../../../hooks/usePermission";

/**
 * CommonDashboard - Fallback dashboard for roles without specific dashboards
 * 
 * Header and logout are handled by AppShell.
 * This component only renders the dashboard content.
 */
const CommonDashboard = () => {
    const user = useSelector((state) => state.auth.user || state.clinicAdmin?.admin);
    const { can, canAny } = usePermissions();

    // Build menu dynamically based on any permissions
    const allMenuItems = [
        {
            title: "Patients",
            description: "View patient records",
            icon: "🏥",
            path: "/app/patients",
            resource: "PATIENT",
            action: "VIEW",
            color: "from-emerald-500 to-teal-600"
        },
        {
            title: "Appointments",
            description: "View appointments",
            icon: "📅",
            path: "/app/appointments",
            resource: "APPOINTMENT",
            action: "VIEW",
            color: "from-blue-500 to-cyan-600"
        },
        {
            title: "Case Sheets",
            description: "View case sheets",
            icon: "📋",
            path: "/app/case-sheets",
            resource: "CASE_SHEET",
            action: "VIEW",
            color: "from-violet-500 to-purple-600"
        },
        {
            title: "Billing",
            description: "View billing",
            icon: "💰",
            path: "/app/billing",
            resource: "BILLING",
            action: "VIEW",
            color: "from-orange-500 to-amber-600"
        },
        {
            title: "Prescriptions",
            description: "View prescriptions",
            icon: "💊",
            path: "/app/prescriptions",
            resource: "PRESCRIPTION",
            action: "VIEW",
            color: "from-pink-500 to-rose-600"
        },
        {
            title: "Imaging",
            description: "View imaging records",
            icon: "🔬",
            path: "/app/imaging",
            resource: "IMAGING",
            action: "VIEW",
            color: "from-indigo-500 to-blue-600"
        }
    ];

    // Filter menu items based on permissions
    const visibleMenuItems = allMenuItems.filter(item => can(item.resource, item.action));

    return (
        <div>
            {/* Welcome Section */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800">
                    Dashboard
                </h2>
                <p className="text-gray-500 mt-1">Your workspace</p>
            </div>

            {visibleMenuItems.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🔒</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">No Permissions Assigned</h3>
                    <p className="text-gray-500">
                        Contact your administrator to get access to system features.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {visibleMenuItems.map((item) => (
                        <Link
                            key={item.path}
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
            )}
        </div>
    );
};

export default CommonDashboard;
