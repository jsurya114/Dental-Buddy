import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axiosInstance from "../api/axios";
import PermissionEditor from "../components/PermissionEditor";

const RoleEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [isSystemRole, setIsSystemRole] = useState(false);
    const [formData, setFormData] = useState({
        displayName: "",
        code: "",
        description: "",
        icon: "🔐",
        isProfessional: false,
        isActive: true,
        permissions: {}
    });

    const iconOptions = ["🔐", "🦷", "📞", "🧾", "🪑", "💊", "🔬", "👨‍⚕️", "👩‍⚕️", "🏥", "📋", "💉"];

    useEffect(() => {
        const fetchRole = async () => {
            try {
                const response = await axiosInstance.get(`/admin/roles/${id}`);
                const role = response.data.role;
                setFormData({
                    displayName: role.displayName || "",
                    code: role.code || "",
                    description: role.description || "",
                    icon: role.icon || "🔐",
                    isProfessional: role.isProfessional || false,
                    isActive: role.isActive ?? true,
                    permissions: role.permissions || {}
                });
                setIsSystemRole(role.isSystemRole || false);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to fetch role");
            } finally {
                setLoading(false);
            }
        };
        fetchRole();
    }, [id]);

    const handleChange = (e) => {
        const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        setFormData({
            ...formData,
            [e.target.name]: value
        });
    };

    const handlePermissionChange = (permissions) => {
        setFormData({
            ...formData,
            permissions
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.displayName.trim()) {
            setError("Role display name is required");
            return;
        }
        if (!formData.code.trim()) {
            setError("Role code is required");
            return;
        }

        try {
            setSaving(true);
            await axiosInstance.put(`/admin/roles/${id}`, formData);
            navigate("/clinic-admin/roles");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update role");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
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
                                    <p className="text-xs text-gray-500">Edit Role</p>
                                </div>
                            </Link>
                        </div>
                        <Link
                            to="/clinic-admin/roles"
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm"
                        >
                            ← Back to Roles
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Role</h2>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                            {error}
                        </div>
                    )}

                    {isSystemRole && (
                        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700">
                            This is a system role. Some properties cannot be modified.
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Role Display Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Role Display Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="displayName"
                                value={formData.displayName}
                                onChange={handleChange}
                                disabled={isSystemRole}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50"
                            />
                            <p className="mt-1 text-sm text-gray-500">This is what users will see in the UI</p>
                        </div>

                        {/* Role Code */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Role Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                disabled={isSystemRole}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50"
                            />
                            <p className="mt-1 text-sm text-gray-500">Unique code for the role (used in login URL)</p>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                            />
                        </div>

                        {/* Is Doctor/Professional Checkbox */}
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                name="isProfessional"
                                id="isProfessional"
                                checked={formData.isProfessional}
                                onChange={handleChange}
                                disabled={isSystemRole}
                                className="w-5 h-5 text-teal-500 border-gray-300 rounded focus:ring-teal-500 disabled:opacity-50"
                            />
                            <div>
                                <label htmlFor="isProfessional" className="text-sm font-semibold text-gray-700 block">
                                    Is Doctor?
                                </label>
                                <p className="text-xs text-gray-500">Check this if users with this role can treat patients.</p>
                            </div>
                        </div>

                        {/* Icon Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Icon
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {iconOptions.map((icon) => (
                                    <button
                                        key={icon}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, icon })}
                                        className={`w-12 h-12 text-2xl rounded-xl border-2 transition-all ${formData.icon === icon
                                            ? "border-teal-500 bg-teal-50"
                                            : "border-gray-200 hover:border-gray-300"
                                            }`}
                                    >
                                        {icon}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Active Status */}
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                name="isActive"
                                id="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                                disabled={isSystemRole}
                                className="w-5 h-5 text-teal-500 border-gray-300 rounded focus:ring-teal-500"
                            />
                            <label htmlFor="isActive" className="text-sm font-semibold text-gray-700">
                                Role is Active
                            </label>
                        </div>

                        {/* Permissions Section */}
                        {!isSystemRole && (
                            <div className="pt-6 border-t border-gray-200">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">
                                    Permissions
                                </h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    Define what users with this role can do. Check the boxes to grant permissions.
                                </p>
                                <div className="border border-gray-200 rounded-xl overflow-hidden">
                                    <PermissionEditor
                                        permissions={formData.permissions}
                                        onChange={handlePermissionChange}
                                        disabled={isSystemRole}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate("/clinic-admin/roles")}
                                className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-cyan-700 transition-all disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default RoleEdit;
