import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginClinicAdmin, clearError } from "../redux/clinicAdminSlice";
import {
    ShieldCheck, User, Lock, Loader2, AlertCircle,
    Eye, EyeOff
} from "lucide-react";

const ClinicAdminLogin = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, isAuthenticated } = useSelector((state) => state.clinicAdmin);

    const [formData, setFormData] = useState({
        loginId: "",
        password: ""
    });
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/clinic-admin/dashboard");
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(loginClinicAdmin(formData));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 relative overflow-hidden">

            {/* Background Effects */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-sky-950/40"></div>
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-sky-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="relative w-full max-w-[440px] z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">

                {/* Login Card */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/50 overflow-hidden relative">

                    {/* Top Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-sky-500 to-transparent blur-[1px]"></div>

                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-sky-500 to-sky-700 rounded-2xl mb-6 shadow-lg shadow-sky-500/30 transform hover:scale-105 transition-transform duration-300">
                            <ShieldCheck className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">System Admin</h1>
                        <p className="text-gray-400 text-sm font-medium">Restricted Access Portal</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-8 p-4 bg-red-900/30 border border-red-500/30 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 backdrop-blur-md">
                            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                            <p className="text-red-200 text-sm font-medium leading-tight">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
                                Administrator ID
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-sky-400 transition-colors">
                                    <User className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    name="loginId"
                                    value={formData.loginId}
                                    onChange={handleChange}
                                    placeholder="Enter Admin ID"
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all font-medium text-white placeholder:text-gray-600 hover:bg-gray-800/80"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
                                Secure Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-sky-400 transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••••••"
                                    required
                                    className="w-full pl-11 pr-12 py-3.5 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all font-medium text-white placeholder:text-gray-600 hover:bg-gray-800/80"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-white hover:bg-gray-700 rounded-lg transition-all"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-sky-600 to-sky-700 text-white font-bold rounded-xl hover:from-sky-500 hover:to-sky-600 hover:shadow-lg hover:shadow-sky-500/25 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin text-sky-200" />
                                    <span>Authenticating...</span>
                                </>
                            ) : (
                                "Authenticate"
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-xs text-gray-500 font-medium tracking-wide">
                            © 2026 Dental Buddy System. Unauthorized access is prohibited.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClinicAdminLogin;
