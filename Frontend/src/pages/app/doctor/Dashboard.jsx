import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { usePermissions } from "../../../hooks/usePermission";

/**
 * DoctorDashboard - Dashboard content for doctor-type roles
 * 
 * Header and logout are handled by AppShell.
 * This component only renders the dashboard content.
 */
const DoctorDashboard = () => {
    const user = useSelector((state) => state.auth.user || state.clinicAdmin?.admin);
    const { can } = usePermissions();

    const menuItems = [
        {
            title: "My Patients",
            description: "View and manage your patients",
            icon: "🏥",
            path: "/app/patients",
            resource: "PATIENT",
            action: "VIEW",
            color: "from-emerald-500 to-teal-600"
        },
        {
            title: "Appointments",
            description: "Today's schedule and upcoming",
            icon: "📅",
            path: "/app/appointments",
            resource: "APPOINTMENT",
            action: "VIEW",
            color: "from-blue-500 to-cyan-600"
        },
        {
            title: "Case Sheets",
            description: "Medical records and treatment notes",
            icon: "📋",
            path: "/app/case-sheets",
            resource: "CASE_SHEET",
            action: "VIEW",
            color: "from-violet-500 to-purple-600"
        },
        {
            title: "Prescriptions",
            description: "Write and view prescriptions",
            icon: "💊",
            path: "/app/prescriptions",
            resource: "PRESCRIPTION",
            action: "VIEW",
            color: "from-orange-500 to-amber-600"
        },
        {
            title: "Imaging",
            description: "X-rays and diagnostic images",
            icon: "🔬",
            path: "/app/imaging",
            resource: "IMAGING",
            action: "VIEW",
            color: "from-pink-500 to-rose-600"
        },
        // {
        //     title: "Billing",
        //     description: "View patient billing",
        //     icon: "💰",
        //     path: "/app/billing",
        //     resource: "BILLING",
        //     action: "VIEW",
        //     color: "from-indigo-500 to-blue-600"
        // }
    ];

    // Filter menu items based on permissions
    const visibleMenuItems = menuItems.filter(item => can(item.resource, item.action));

    return (
        <div>
            {/* Welcome Section */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800">
                    Doctor Portal
                </h2>
                <p className="text-gray-500 mt-1">Your clinical workspace</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-2xl font-bold text-emerald-600">--</p>
                    <p className="text-sm text-gray-500">Today's Patients</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-2xl font-bold text-blue-600">--</p>
                    <p className="text-sm text-gray-500">Appointments</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-2xl font-bold text-violet-600">--</p>
                    <p className="text-sm text-gray-500">Pending Cases</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-2xl font-bold text-amber-600">--</p>
                    <p className="text-sm text-gray-500">Prescriptions</p>
                </div>
            </div>

            {/* Menu Grid */}
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
        </div>
    );
};

export default DoctorDashboard;
