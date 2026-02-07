import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axios";

const RoleCreate = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        displayName: "",
        code: "",
        description: "",
        icon: "🔐"
    });

    const iconOptions = ["🔐", "🦷", "📞", "🧾", "🪑", "💊", "🔬", "👨‍⚕️", "👩‍⚕️", "🏥", "📋", "💉"];

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
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
            setLoading(true);
            await axiosInstance.post("/admin/roles", formData);
            navigate("/clinic-admin/roles");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create role");
        } finally {
            setLoading(false);
        }
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
                                    <p className="text-xs text-gray-500">Create Role</p>
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

            <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Role</h2>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                            {error}
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
                                placeholder="e.g., Dental Surgeon, Front Desk"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                                placeholder="e.g., doctor, receptionist"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                                placeholder="Brief description of this role"
                                rows={3}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                            />
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
                                disabled={loading}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-cyan-700 transition-all disabled:opacity-50"
                            >
                                {loading ? "Creating..." : "Create Role"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default RoleCreate;
