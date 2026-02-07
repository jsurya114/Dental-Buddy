import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../redux/authSlice";

/**
 * Header - Top navigation bar with user info and logout
 */
const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Get user from either auth slice
    const authUser = useSelector((state) => state.auth.user);
    const clinicAdmin = useSelector((state) => state.clinicAdmin?.admin);
    const user = authUser || clinicAdmin;

    const handleLogout = () => {
        dispatch(logout());
        navigate("/");
    };

    return (
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-40">
            <div className="px-6 h-16 flex justify-between items-center">
                {/* Page Title Area */}
                <div>
                    <h1 className="text-lg font-semibold text-gray-800">
                        Welcome back, {user?.fullName || user?.loginId || "User"} 👋
                    </h1>
                </div>

                {/* User Actions */}
                <div className="flex items-center gap-4">
                    {/* User Info */}
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-gray-700">
                            {user?.fullName || user?.loginId}
                        </p>
                        <p className="text-xs text-gray-500">{user?.role || user?.roleCode}</p>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors duration-200 font-medium text-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
