import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateUser, clearError, clearSuccess } from "../redux/userSlice";
import axiosInstance from "../api/axios";
import { Save, User, Key, Shield, Eye, EyeOff, CheckCircle2, ChevronLeft, Loader2, AlertCircle } from "lucide-react";

/**
 * UserEdit
 * Reskinned to Sky Blue Theme
 */
const UserEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const dispatch = useDispatch();
    const { loading, error, success } = useSelector((state) => state.users);

    const [roles, setRoles] = useState([]);
    const [rolesLoading, setRolesLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    const [formData, setFormData] = useState({
        fullName: "",
        loginId: "",
        password: "",
        roleCode: "",
        isActive: true
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch roles
                const rolesResponse = await axiosInstance.get("/admin/roles");
                const availableRoles = (rolesResponse.data.roles || []).filter(
                    r => !r.isSystemRole && r.isActive
                );
                setRoles(availableRoles);

                // Fetch user
                const userResponse = await axiosInstance.get(`/admin/users/${id}`);
                const user = userResponse.data.user;

                setFormData({
                    fullName: user.fullName || "",
                    loginId: user.loginId || "",
                    password: "", // Leave blank to keep current
                    roleCode: user.roleCode || "",
                    isActive: user.isActive ?? true
                });

            } catch (err) {
                console.error("Failed to fetch data:", err);
            } finally {
                setRolesLoading(false);
                setInitialLoading(false);
            }
        };

        fetchData();
        dispatch(clearError());
        dispatch(clearSuccess());
    }, [dispatch, id]);

    useEffect(() => {
        if (success) {
            navigate("/app/users");
        }
    }, [success, navigate]);

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

        if (!formData.fullName.trim()) return alert("Full name is required");
        if (!formData.loginId.trim()) return alert("Login ID is required");
        if (!formData.roleCode) return alert("Please select a role");

        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;

        dispatch(updateUser({ id, userData: updateData }));
    };

    if (initialLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-4">
                    <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
                </div>
                <p className="text-gray-500 font-medium animate-pulse">Loading User Details...</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <button
                        onClick={() => navigate("/app/users")}
                        className="text-sky-500 hover:text-sky-700 flex items-center gap-1 text-sm font-bold mb-2 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" /> Back to Users
                    </button>
                    <h1 className="text-3xl font-bold text-sky-950 tracking-tight">Edit User</h1>
                    <p className="text-sky-700/80 mt-1">Update account details for <span className="font-semibold text-sky-900">{formData.fullName}</span></p>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-xl shadow-sky-900/5 border border-sky-100 overflow-hidden">
                {/* Progress Bar */}
                <div className="h-1 bg-sky-50 w-full">
                    <div className="h-full bg-sky-500 w-2/3"></div>
                </div>

                {error && (
                    <div className="bg-red-50 border-b border-red-100 text-red-700 p-4 text-sm flex items-center gap-2 font-medium">
                        <AlertCircle className="w-5 h-5" /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-8 space-y-8">

                    {/* Basic Details */}
                    <div className="space-y-6">
                        <h2 className="text-lg font-bold text-sky-900 flex items-center gap-2 pb-2 border-b border-sky-100">
                            <User className="w-5 h-5 text-sky-600" /> Account Details
                        </h2>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-sky-800">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="e.g., Dr. Alice Smith"
                                className="w-full px-4 py-3 bg-sky-50/50 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium text-sky-900 placeholder-sky-300"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-sky-800">
                                    Login ID <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400" />
                                    <input
                                        type="text"
                                        name="loginId"
                                        value={formData.loginId}
                                        onChange={handleChange}
                                        placeholder="e.g., dralice"
                                        className="w-full pl-10 pr-4 py-3 bg-sky-50/50 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-mono text-sm text-sky-900 placeholder-sky-300"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-sky-800">
                                    Assign Role <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400 pointer-events-none" />
                                    {rolesLoading ? (
                                        <div className="w-full px-4 py-3 bg-sky-50 border border-sky-200 rounded-xl text-sky-400 text-sm">
                                            Loading roles...
                                        </div>
                                    ) : (
                                        <select
                                            name="roleCode"
                                            value={formData.roleCode}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-10 py-3 bg-sky-50/50 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all appearance-none cursor-pointer text-sky-900"
                                        >
                                            <option value="">Select a role...</option>
                                            {roles.map((role) => (
                                                <option key={role._id} value={role.code}>
                                                    {role.displayName}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-sky-800 flex items-center justify-between">
                                <span>Password</span>
                                <span className="text-xs font-normal text-sky-400">Leave blank to keep current</span>
                            </label>
                            <div className="relative">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter new password to change"
                                    className="w-full pl-10 pr-12 py-3 bg-sky-50/50 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-sky-900 placeholder-sky-300"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-400 hover:text-sky-600 transition-colors p-1"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Status */}
                    <div className="space-y-6">
                        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-5 flex items-start gap-4 hover:bg-sky-100/50 transition-colors cursor-pointer" onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}>
                            <div className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.isActive ? 'bg-sky-600 border-sky-600' : 'bg-white border-gray-300'}`}>
                                {formData.isActive && <CheckCircle2 className="w-4 h-4 text-white" />}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-sky-900">Active Account</h4>
                                <p className="text-sm text-sky-600/80 mt-1">
                                    User can access the system. Disabling will immediately revoke access.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-6 flex items-center justify-end gap-4 border-t border-sky-100">
                        <button
                            type="button"
                            onClick={() => navigate("/app/users")}
                            className="px-6 py-3 text-sky-700 hover:bg-sky-50 rounded-xl font-bold transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-sky-600 text-white rounded-xl shadow-lg shadow-sky-600/20 hover:bg-sky-700 hover:shadow-xl hover:shadow-sky-600/30 transition-all font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" /> Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" /> Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserEdit;
