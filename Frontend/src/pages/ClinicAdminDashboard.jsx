import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout as logoutClinicAdmin } from "../redux/clinicAdminSlice";
import { logout as logoutAuth } from "../redux/authSlice";

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
            title: "Manage Roles",
            description: "Configure and manage user roles and permissions",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            ),
            color: "from-violet-500 to-purple-600",
            hoverColor: "group-hover:from-violet-600 group-hover:to-purple-700",
            path: "/clinic-admin/roles",
            ready: true
        },
        {
            title: "Manage Users",
            description: "Add, edit, and manage clinic staff members",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            color: "from-blue-500 to-cyan-600",
            hoverColor: "group-hover:from-blue-600 group-hover:to-cyan-700",
            path: "/clinic-admin/users",
            ready: true
        },
        {
            title: "Clinic Settings",
            description: "Configure clinic profile and preferences",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            color: "from-emerald-500 to-teal-600",
            hoverColor: "group-hover:from-emerald-600 group-hover:to-teal-700",
            path: null,
            ready: false
        }
    ];

    const handleCardClick = (card) => {
        if (card.ready && card.path) {
            navigate(card.path);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-800">Dental Buddy</h1>
                                <p className="text-xs text-gray-500">Admin Dashboard</p>
                            </div>
                        </div>

                        {/* User Menu */}
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-gray-700">{admin?.loginId}</p>
                                <p className="text-xs text-gray-500">{admin?.role}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors duration-200 font-medium text-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <div className="bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
                        <div className="relative">
                            <h2 className="text-3xl font-bold mb-2">Welcome, Clinic Admin! 👋</h2>
                            <p className="text-white/80 text-lg">Manage your clinic operations from this dashboard</p>
                        </div>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Login ID</p>
                                <p className="font-semibold text-gray-800">{admin?.loginId || "N/A"}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Role</p>
                                <p className="font-semibold text-gray-800">{admin?.role || "N/A"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feature Cards */}
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {dashboardCards.map((card, index) => (
                        <div
                            key={index}
                            onClick={() => handleCardClick(card)}
                            className={`group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 ${card.ready ? "cursor-pointer" : "cursor-default opacity-75"}`}
                        >
                            <div className={`w-14 h-14 bg-gradient-to-r ${card.color} ${card.hoverColor} rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg transition-all duration-300`}>
                                {card.icon}
                            </div>
                            <h4 className="text-lg font-bold text-gray-800 mb-2">{card.title}</h4>
                            <p className="text-gray-500 text-sm">{card.description}</p>
                            <div className="mt-4 flex items-center text-teal-600 font-medium text-sm group-hover:translate-x-1 transition-transform duration-200">
                                {card.ready ? (
                                    <>
                                        <span>Open</span>
                                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </>
                                ) : (
                                    <span className="text-gray-400">Coming Soon</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <footer className="mt-auto py-6 text-center text-gray-400 text-sm">
                © 2026 Dental Buddy. All rights reserved.
            </footer>
        </div>
    );
};

export default ClinicAdminDashboard;
