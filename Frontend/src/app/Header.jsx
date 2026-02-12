import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../redux/authSlice";
import { Bell, Search, LogOut, Settings, Menu } from "lucide-react";

/**
 * Header - Responsive with Mobile Toggle
 */
const Header = ({ onToggleSidebar }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const authUser = useSelector((state) => state.auth.user);
    const clinicAdmin = useSelector((state) => state.clinicAdmin?.admin);
    const user = authUser || clinicAdmin;

    const handleLogout = () => {
        dispatch(logout());
        navigate("/");
    };

    return (
        <header className="h-16 bg-sky-100/50 backdrop-blur-md border-b border-sky-200 sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between shadow-sm">
            {/* Mobile Menu Button */}
            <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 text-sky-600 hover:bg-sky-200/50 rounded-xl transition-colors"
                aria-label="Toggle Menu"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-4 ml-auto">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-1.5 text-sky-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-bold border border-sky-200 hover:border-red-100"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign Out</span>
                </button>
            </div>
        </header>
    );
};

export default Header;
