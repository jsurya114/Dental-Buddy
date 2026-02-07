import { useSelector } from "react-redux";
import { NavLink, useLocation } from "react-router-dom";
import { menuConfig } from "../config/menuConfig";

/**
 * Sidebar - Permission-aware navigation sidebar
 * 
 * Reads from menuConfig and filters items based on user permissions.
 * CLINIC_ADMIN sees all items.
 */
const Sidebar = () => {
    const location = useLocation();

    // Get user and permissions from either auth slice
    const authUser = useSelector((state) => state.auth.user);
    const clinicAdmin = useSelector((state) => state.clinicAdmin?.admin);
    const user = authUser || clinicAdmin;
    const permissions = authUser?.permissions || clinicAdmin?.permissions;

    /**
     * Check if user can access a menu item
     */
    /**
     * Check if user can access a menu item
     */
    const canAccess = (item) => {
        const { module, action, allowedRoles } = item;
        const userRole = user?.role || user?.roleCode;

        // 1. Strict Role Restriction (if defined) overrides everything
        if (allowedRoles && !allowedRoles.includes(userRole)) {
            return false;
        }

        // 2. Dashboard is always accessible
        if (!module) return true;

        // 3. CLINIC_ADMIN has all permissions (unless restricted by step 1)
        if (userRole === "CLINIC_ADMIN") return true;

        // 4. Check specific permission
        if (!permissions || !permissions[module]) return false;

        // If action is an array, check if user has ANY of the permissions
        if (Array.isArray(action)) {
            return action.some(a => permissions[module].includes(a));
        }

        return permissions[module].includes(action);
    };

    /**
     * Get active state for NavLink
     */
    const isActive = (path) => {
        return location.pathname.includes(path);
    };

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
            {/* Logo */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-xl text-white">🦷</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-800">Dental Buddy</h1>
                        <p className="text-xs text-gray-500">EMR System</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto">
                <ul className="space-y-1">
                    {menuConfig.map((item) =>
                        canAccess(item) ? (
                            <li key={item.path}>
                                <NavLink
                                    to={`/app/${item.path}`}
                                    className={({ isActive: navActive }) =>
                                        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${navActive || isActive(item.path)
                                            ? "bg-teal-600 text-white shadow-md"
                                            : "text-gray-600 hover:bg-gray-100"
                                        }`
                                    }
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    <span className="font-medium">{item.label}</span>
                                </NavLink>
                            </li>
                        ) : null
                    )}
                </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100">
                <div className="px-4 py-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500">Logged in as</p>
                    <p className="text-sm font-medium text-gray-700 truncate">
                        {user?.fullName || user?.loginId || "Unknown"}
                    </p>
                    <p className="text-xs text-teal-600 font-medium">
                        {user?.role || user?.roleCode || "No Role"}
                    </p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
