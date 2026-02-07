import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateUser, clearError, clearSuccess } from "../redux/userSlice";
import axiosInstance from "../api/axios";

const UserEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const dispatch = useDispatch();
    const { loading, error, success } = useSelector((state) => state.users);

    const [roles, setRoles] = useState([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [formData, setFormData] = useState({
        fullName: "",
        loginId: "",
        password: "",
        roleCode: "",
        isActive: true
    });

    useEffect(() => {
        dispatch(clearError());
        dispatch(clearSuccess());
        fetchData();
    }, [id, dispatch]);

    useEffect(() => {
        if (success) {
            navigate("/clinic-admin/users");
        }
    }, [success, navigate]);

    const fetchData = async () => {
        try {
            const [userRes, rolesRes] = await Promise.all([
                axiosInstance.get(`/admin/users/${id}`),
                axiosInstance.get("/admin/roles")
            ]);

            const user = userRes.data.user;
            setFormData({
                fullName: user.fullName || "",
                loginId: user.loginId || "",
                password: "",
                roleCode: user.roleCode || "",
                isActive: user.isActive ?? true
            });

            // Filter out system roles
            const availableRoles = (rolesRes.data.roles || []).filter(
                r => !r.isSystemRole && r.isActive
            );
            setRoles(availableRoles);
        } catch (err) {
            console.error("Failed to fetch data:", err);
        } finally {
            setPageLoading(false);
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
        if (!formData.roleCode) {
            return alert("Please select a role");
        }

        // Only send password if it was changed
        const userData = { ...formData };
        if (!userData.password) {
            delete userData.password;
        }

        dispatch(updateUser({ id, userData }));
    };

    if (pageLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
                <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin"></div>
            </div>
        );
    }

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
                                    <p className="text-xs text-gray-500">Edit User</p>
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
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit User</h2>

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
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Leave blank to keep current password"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                            <p className="mt-1 text-sm text-gray-500">Leave blank to keep current password</p>
                        </div>

                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Role <span className="text-red-500">*</span>
                            </label>
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
                                disabled={loading}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-cyan-700 transition-all disabled:opacity-50"
                            >
                                {loading ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default UserEdit;
