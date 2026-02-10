import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearError } from "../redux/authSlice";
import axiosInstance from "../api/axios";
import { getDashboardRoute } from "../config/roleDashboardMap";

const Login = () => {
    const { role } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

    const [roleInfo, setRoleInfo] = useState(null);
    const [roleLoading, setRoleLoading] = useState(true);
    const [roleError, setRoleError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        loginId: "",
        password: ""
    });

    // Convert URL slug to role code: clinic-admin -> CLINIC_ADMIN
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

        fetchRoleInfo();
        dispatch(clearError());
    }, [role, dispatch]);

    // Redirect on successful login using system dashboard map
    // useEffect(() => {
    //     if (isAuthenticated && user) {
    //         const dashboardRoute = getDashboardRoute(user.role);
    //         navigate(dashboardRoute, { replace: true });
    //     }
    // }, [isAuthenticated, user, navigate]);

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
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
                    <p className="text-gray-500 text-lg">Loading...</p>
                </div>
            </div>
        );
    }

    if (roleError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Invalid Role</h1>
                    <p className="text-gray-500 mb-6">{roleError}</p>
                    <Link
                        to="/"
                        className="inline-block px-6 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-all duration-200"
                    >
                        Back to Role Selection
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            {/* Background decoration - Optional, kept subtle or removed */}
            {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-50 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-50 rounded-full blur-3xl"></div>
            </div> */}

            <div className="relative w-full max-w-md">
                {/* Back link */}
                <Link
                    to="/"
                    className="inline-flex items-center text-gray-500 hover:text-gray-800 mb-6 transition-colors"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Role Selection
                </Link>

                {/* Login Card */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-50 rounded-2xl mb-4 text-teal-600">
                            <span className="text-3xl">{roleInfo?.icon || "🔐"}</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-1">{roleInfo?.displayName || "Login"}</h1>
                        <p className="text-gray-500">Enter your credentials to continue</p>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Login ID
                            </label>
                            <input
                                type="text"
                                name="loginId"
                                value={formData.loginId}
                                onChange={handleChange}
                                placeholder="Enter your login ID"
                                required
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    required
                                    className="w-full px-4 py-3 pr-12 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center mt-8 text-white/60 text-sm">
                    <span className="text-white font-medium">Dental Buddy</span>
                </p>
            </div>
        </div>
    );
};

export default Login;
