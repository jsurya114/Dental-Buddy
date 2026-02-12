import { useSelector } from "react-redux";
import { NavLink, useLocation } from "react-router-dom";
import { menuConfig } from "../config/menuConfig";
import * as LucideIcons from "lucide-react";

/**
 * Sidebar - Responsive Mobile Drawer
 */
const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();

    // Get user and permissions
    const authUser = useSelector((state) => state.auth.user);
    const clinicAdmin = useSelector((state) => state.clinicAdmin?.admin);
    const user = authUser || clinicAdmin;
    const permissions = authUser?.permissions || clinicAdmin?.permissions;

    const canAccess = (item) => {
        const { module, action, allowedRoles } = item;
        const userRole = user?.role || user?.roleCode;

        if (allowedRoles && !allowedRoles.includes(userRole)) return false;
        if (!module) return true;
        if (userRole === "CLINIC_ADMIN") return true;
        if (!permissions || !permissions[module]) return false;

        if (Array.isArray(action)) {
            return action.some(a => permissions[module].includes(a));
        }
        return permissions[module].includes(action);
    };

    const isActive = (path) => location.pathname.includes(path);

    // Dynamic Icon Component
    const Icon = ({ name }) => {
        const LucideIcon = LucideIcons[name] || LucideIcons.HelpCircle;
        return <LucideIcon size={20} />;
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-sky-950/40 backdrop-blur-sm z-50 lg:hidden transition-all duration-300"
                    onClick={onClose}
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 w-64 bg-sky-200 text-sky-950 flex flex-col shadow-2xl lg:shadow-xl border-r border-sky-300/50 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Logo */}
                <div className="p-6 border-b border-sky-300/50 relative">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-sky-600 rounded-xl flex items-center justify-center shadow-md shadow-sky-600/20">
                            <LucideIcons.Activity className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-sky-950 tracking-tight leading-tight">Dental Buddy</h1>
                            <p className="text-[10px] text-sky-700 font-bold uppercase tracking-widest">Medical SaaS</p>
                        </div>
                    </div>
                    {/* Close Button Mobile */}
                    <button
                        onClick={onClose}
                        className="lg:hidden absolute right-4 top-1/2 -translate-y-1/2 p-2 text-sky-700 hover:bg-sky-300/50 rounded-lg"
                    >
                        <LucideIcons.X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 overflow-y-auto space-y-1 custom-scrollbar">
                    {menuConfig.map((item) =>
                        canAccess(item) ? (
                            <div key={item.path}>
                                <NavLink
                                    to={`/app/${item.path}`}
                                    onClick={() => {
                                        if (window.innerWidth < 1024) onClose();
                                    }}
                                    className={({ isActive: navActive }) =>
                                        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${navActive || isActive(item.path)
                                            ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30 font-bold translate-x-1"
                                            : "text-sky-800 hover:bg-sky-300/50 hover:text-sky-950 font-bold hover:translate-x-1"
                                        }`
                                    }
                                >
                                    <Icon name={item.icon} />
                                    <span className="text-sm tracking-tight">{item.label}</span>
                                    {(item.path === 'patients' || item.path === 'appointments') && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-0 group-[.active]:opacity-100 transition-opacity" />
                                    )}
                                </NavLink>
                            </div>
                        ) : null
                    )}
                </nav>

                {/* User Profile */}
                <div className="p-4 border-t border-sky-300/50 bg-sky-200">
                    <div className="bg-sky-100/50 rounded-2xl p-3 flex items-center gap-3 border border-sky-300/30 shadow-sm">
                        <div className="w-10 h-10 min-w-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center text-white font-black shadow-inner">
                            {(user?.fullName?.[0] || user?.loginId?.[0] || "U").toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-black text-sky-950 truncate uppercase tracking-tight">
                                {user?.fullName || user?.loginId || "User"}
                            </p>
                            <p className="text-[10px] text-sky-600 truncate font-bold uppercase tracking-wider">
                                {user?.role?.replace('_', ' ').toLowerCase() || "Restricted"}
                            </p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
