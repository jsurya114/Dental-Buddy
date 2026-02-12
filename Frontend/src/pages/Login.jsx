import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearError } from "../redux/authSlice";
import axiosInstance from "../api/axios";
import {
    Lock, User, ArrowLeft, Loader2, AlertCircle,
    ShieldCheck, Stethoscope, Users, Monitor, UserCog, Eye, EyeOff
} from "lucide-react";

// Map role codes to icons
const ROLE_ICONS = {
    "CLINIC_ADMIN": ShieldCheck,
    "DOCTOR": Stethoscope,
    "FRONT_DESK": Monitor,
    "PATIENT": Users,
    "SUPER_ADMIN": UserCog
};

const Login = () => {
    const { role } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { loading, error } = useSelector((state) => state.auth);

    const [roleInfo, setRoleInfo] = useState(null);
    const [roleLoading, setRoleLoading] = useState(true);
    const [roleError, setRoleError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        loginId: "",
        password: ""
    });

    // Convert URL slug to role code
    const roleCode = role ? role.toUpperCase().replace(/-/g, "_") : "";

    useEffect(() => {
        if (!role) {
            navigate("/");
        }
    }, [role, navigate]);

    // Fetch role info on mount
    useEffect(() => {
        const fetchRoleInfo = async () => {
            try {
                const response = await axiosInstance.get(`/public/roles/${role}`);
                setRoleInfo(response.data.role);
                setRoleError(null);
            } catch (err) {
                setRoleError("Role not found or inactive");
            } finally {
                setRoleLoading(false);
            }
        };

        if (role) {
            fetchRoleInfo();
        }
        dispatch(clearError());
    }, [role, dispatch]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(loginUser({
            loginId: formData.loginId,
            password: formData.password,
            roleCode
        }));
    };

    if (roleLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
                    </div>
                </div>
            </div>
        );
    }

    if (roleError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center max-w-md w-full animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-800 mb-2">Invalid Access</h1>
                    <p className="text-gray-500 mb-6">{roleError}</p>
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all active:scale-95 w-full"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Selection
                    </Link>
                </div>
            </div>
        );
    }

    const RoleIcon = roleInfo ? (ROLE_ICONS[roleInfo.code] || Lock) : Lock;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50/20 to-slate-100 p-4 relative overflow-hidden">

            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] left-[20%] w-64 h-64 bg-teal-200/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-[20%] right-[20%] w-64 h-64 bg-cyan-200/20 rounded-full blur-3xl animate-pulse delay-700"></div>
            </div>

            <div className="relative w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Back Link */}
                <Link
                    to="/"
                    className="inline-flex items-center text-sky-600 hover:text-sky-800 mb-6 transition-colors font-black text-xs sm:text-sm group bg-white/50 px-4 py-2 rounded-xl border border-sky-100/50 backdrop-blur-sm shadow-sm"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Switch Role
                </Link>

                {/* Login Card */}
                <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-sky-900/10 border border-white/50 p-6 sm:p-10 relative overflow-hidden">

                    {/* Top Accent Line */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-500 to-cyan-500"></div>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-3xl mb-5 text-teal-600 shadow-inner">
                            <RoleIcon className="w-10 h-10" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">{roleInfo?.displayName || "Login"}</h1>
                        <p className="text-gray-500 text-sm">Please enter your credentials to verify your identity.</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-red-600 text-sm font-medium leading-tight">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                                Login ID
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors">
                                    <User className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    name="loginId"
                                    value={formData.loginId}
                                    onChange={handleChange}
                                    placeholder="Enter your ID"
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium text-gray-700 placeholder:text-gray-400 group-hover:bg-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                                Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    required
                                    className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium text-gray-700 placeholder:text-gray-400 group-hover:bg-white"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 hover:shadow-lg hover:shadow-gray-900/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                                    <span>Verifying...</span>
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-gray-400 text-xs font-medium flex items-center justify-center gap-1.5 opacity-60">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Secure Clinical Access
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
