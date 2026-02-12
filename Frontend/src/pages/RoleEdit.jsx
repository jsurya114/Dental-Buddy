import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../api/axios";
import PermissionEditor from "../components/PermissionEditor";
import { Save, Shield, Code, Check, ChevronLeft, Lock, Loader2, AlertCircle } from "lucide-react";

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
            navigate("/app/roles");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update role");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-4">
                    <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
                </div>
                <p className="text-gray-500 font-medium animate-pulse">Loading Role Details...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <button
                        onClick={() => navigate("/app/roles")}
                        className="text-sky-500 hover:text-sky-700 flex items-center gap-1 text-sm font-bold mb-2 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" /> Back to Roles
                    </button>
                    <h1 className="text-3xl font-bold text-sky-950 tracking-tight flex items-center gap-3">
                        Edit Role: <span className="text-sky-600">{formData.displayName}</span>
                    </h1>
                </div>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => navigate("/app/roles")}
                        className="px-5 py-2.5 text-sky-700 bg-white border border-sky-200 hover:bg-sky-50 rounded-xl font-bold transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="px-6 py-2.5 bg-sky-600 text-white rounded-xl shadow-lg shadow-sky-600/20 hover:bg-sky-700 hover:shadow-xl hover:shadow-sky-600/30 transition-all font-bold flex items-center gap-2 disabled:opacity-50 active:scale-95"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Column: Role Configuration */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-[2rem] shadow-sm border border-sky-100 overflow-hidden sticky top-6">
                        {isSystemRole && (
                            <div className="bg-sky-900 border-b border-sky-800 p-4">
                                <div className="flex items-start gap-3">
                                    <Lock className="w-5 h-5 text-sky-300 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-bold text-white">System Protected Role</h4>
                                        <p className="text-xs text-sky-200 mt-1">
                                            Core properties (Code, permissions) are locked to ensure system stability.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 border-b border-red-100 text-red-700 p-4 text-sm flex items-center gap-2 font-medium">
                                <AlertCircle className="w-5 h-5" /> {error}
                            </div>
                        )}

                        <div className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-sky-500 uppercase tracking-wider mb-2">Display Name</label>
                                    <input
                                        type="text"
                                        name="displayName"
                                        value={formData.displayName}
                                        onChange={handleChange}
                                        disabled={isSystemRole}
                                        className="w-full px-4 py-2.5 bg-sky-50/50 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium disabled:opacity-60 disabled:cursor-not-allowed text-sky-900"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-sky-500 uppercase tracking-wider mb-2">Role Code</label>
                                    <div className="relative">
                                        <Code className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400" />
                                        <input
                                            type="text"
                                            name="code"
                                            value={formData.code}
                                            onChange={handleChange}
                                            disabled={isSystemRole}
                                            className="w-full pl-9 pr-4 py-2.5 bg-sky-50/50 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-mono text-sm uppercase disabled:opacity-60 disabled:cursor-not-allowed text-sky-900"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-sky-500 uppercase tracking-wider mb-2">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full px-4 py-2.5 bg-sky-50/50 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all resize-none text-sm text-sky-900"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-sky-100">
                                <label className="block text-xs font-bold text-sky-500 uppercase tracking-wider">Settings</label>

                                <label className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${formData.isProfessional ? 'bg-sky-50 border-sky-200' : 'bg-white border-sky-200 hover:bg-sky-50'} ${isSystemRole ? 'opacity-60 pointer-events-none' : ''}`}>
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData.isProfessional ? 'bg-sky-600 border-sky-600' : 'bg-white border-gray-300'}`}>
                                        {formData.isProfessional && <Check className="w-3.5 h-3.5 text-white" />}
                                    </div>
                                    <input type="checkbox" name="isProfessional" checked={formData.isProfessional} onChange={handleChange} disabled={isSystemRole} className="hidden" />
                                    <span className="text-sm font-bold text-sky-800">Is Doctor?</span>
                                    <p className="text-[10px] text-sky-500 font-medium">Enables clinical features</p>
                                </label>

                                <label className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${formData.isActive ? 'bg-green-50 border-green-200' : 'bg-white border-sky-200 hover:bg-sky-50'} ${isSystemRole ? 'opacity-60 pointer-events-none' : ''}`}>
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData.isActive ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'}`}>
                                        {formData.isActive && <Check className="w-3.5 h-3.5 text-white" />}
                                    </div>
                                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} disabled={isSystemRole} className="hidden" />
                                    <span className="text-sm font-bold text-sky-800">Active Status</span>
                                </label>
                            </div>

                            <div className="pt-4 border-t border-sky-100">
                                <label className="block text-xs font-bold text-sky-500 uppercase tracking-wider mb-3">Icon Style</label>
                                <div className="flex flex-wrap gap-2">
                                    {iconOptions.map((icon) => (
                                        <button
                                            key={icon}
                                            type="button"
                                            disabled={isSystemRole}
                                            onClick={() => setFormData({ ...formData, icon })}
                                            className={`w-10 h-10 text-xl rounded-xl transition-all flex items-center justify-center disabled:opacity-50 ${formData.icon === icon
                                                ? "bg-sky-50 ring-2 ring-sky-500 shadow-sm"
                                                : "bg-sky-50/50 hover:bg-sky-100"
                                                }`}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Permissions */}
                <div className="lg:col-span-8 flex flex-col h-full">
                    <div className="bg-white rounded-[2rem] shadow-sm border border-sky-100 overflow-hidden flex flex-col h-full min-h-[600px]">
                        <div className="px-8 py-6 border-b border-sky-100 bg-sky-50/30 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-sky-950 flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-sky-600" /> Access Permissions
                                </h3>
                                <p className="text-sm text-sky-700/80">Fine-tune what this role can see and do.</p>
                            </div>
                            {isSystemRole && (
                                <span className="bg-gray-200 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">
                                    Read Only Mode
                                </span>
                            )}
                        </div>

                        <div className="p-8 flex-1 bg-white">
                            <PermissionEditor
                                permissions={formData.permissions}
                                onChange={handlePermissionChange}
                                disabled={isSystemRole}
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default RoleEdit;
