import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createUser, clearError, clearSuccess } from "../redux/userSlice";
import axiosInstance from "../api/axios";

const UserCreate = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading, error, success } = useSelector((state) => state.users);

    const [roles, setRoles] = useState([]);
    const [rolesLoading, setRolesLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        loginId: "",
        password: "",
        roleCode: "",
        isActive: true
    });

    useEffect(() => {
        fetchRoles();
        dispatch(clearError());
        dispatch(clearSuccess());
    }, [dispatch]);

    useEffect(() => {
        if (success) {
            navigate("/clinic-admin/users");
        }
    }, [success, navigate]);

    const fetchRoles = async () => {
        try {
            const response = await axiosInstance.get("/admin/roles");
            // Filter out system roles - users cannot be assigned CLINIC_ADMIN
            const availableRoles = (response.data.roles || []).filter(
                r => !r.isSystemRole && r.isActive
            );
            setRoles(availableRoles);
        } catch (err) {
            console.error("Failed to fetch roles:", err);
        } finally {
            setRolesLoading(false);
        }
    };

    const handleChange = (e) => {
        const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        setFormData({
            ...formData,
            [e.target.name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(clearError());

        if (!formData.fullName.trim()) {
            return alert("Full name is required");
        }
        if (!formData.loginId.trim()) {
            return alert("Login ID is required");
        }
        if (!formData.password) {
            return alert("Password is required");
        }
        if (!formData.roleCode) {
            return alert("Please select a role");
        }

        dispatch(createUser(formData));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <Link to="/clinic-admin/dashboard" className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <span className="text-xl">🦷</span>
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-gray-800">Dental Buddy</h1>
                                    <p className="text-xs text-gray-500">Create User</p>
                                </div>
                            </Link>
                        </div>
                        <Link
                            to="/clinic-admin/users"
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm"
                        >
                            ← Back to Users
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New User</h2>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="e.g., Dr. Ramesh Kumar"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                        </div>

                        {/* Login ID */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Login ID <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="loginId"
                                value={formData.loginId}
                                onChange={handleChange}
                                placeholder="e.g., dr_ramesh"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                            <p className="mt-1 text-sm text-gray-500">This will be used to login</p>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter password"
                                    className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
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

                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Role <span className="text-red-500">*</span>
                            </label>
                            {rolesLoading ? (
                                <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-400">
                                    Loading roles...
                                </div>
                            ) : roles.length === 0 ? (
                                <div className="w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700">
                                    No roles available. Please create a role first.
                                </div>
                            ) : (
                                <select
                                    name="roleCode"
                                    value={formData.roleCode}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                >
                                    <option value="">Select a role</option>
                                    {roles.map((role) => (
                                        <option key={role._id} value={role.code}>
                                            {role.displayName}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Active Status */}
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                name="isActive"
                                id="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                                className="w-5 h-5 text-teal-500 border-gray-300 rounded focus:ring-teal-500"
                            />
                            <label htmlFor="isActive" className="text-sm font-semibold text-gray-700">
                                User is Active
                            </label>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate("/clinic-admin/users")}
                                className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || roles.length === 0}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-cyan-700 transition-all disabled:opacity-50"
                            >
                                {loading ? "Creating..." : "Create User"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default UserCreate;
