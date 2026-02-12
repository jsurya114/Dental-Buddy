import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";
import { Save, Shield, Code, Type, Check, ChevronLeft, Loader2 } from "lucide-react";

const RoleCreate = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        displayName: "",
        code: "",
        description: "",
        icon: "🔐",
        isProfessional: false
    });

    const iconOptions = ["🔐", "🦷", "📞", "🧾", "🪑", "💊", "🔬", "👨‍⚕️", "👩‍⚕️", "🏥", "📋", "💉"];

    const handleChange = (e) => {
        const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        setFormData({
            ...formData,
            [e.target.name]: value
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
            navigate("/app/roles");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create role");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <button
                        onClick={() => navigate("/app/roles")}
                        className="text-sky-500 hover:text-sky-700 flex items-center gap-1 text-sm font-bold mb-2 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" /> Back to Roles
                    </button>
                    <h1 className="text-3xl font-bold text-sky-950 tracking-tight">Create New Role</h1>
                    <p className="text-sky-700/80 mt-1">Define permissions and access levels for a new staff role.</p>
                </div>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-[2rem] shadow-xl shadow-sky-900/5 border border-sky-100 overflow-hidden">
                {/* Progress/Status Bar */}
                <div className="h-1 bg-sky-50 w-full">
                    <div className="h-full bg-sky-500 w-1/3"></div>
                </div>

                {error && (
                    <div className="bg-red-50 border-b border-red-100 text-red-700 p-4 text-sm flex items-center gap-2 font-medium">
                        <span className="text-lg">⚠️</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-8 space-y-8">

                    {/* Section 1: Basic Info */}
                    <div className="space-y-6">
                        <h2 className="text-lg font-bold text-sky-900 flex items-center gap-2 pb-2 border-b border-sky-100">
                            <Type className="w-5 h-5 text-sky-600" /> Basic Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                            {/* Basic Info */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-black text-sky-900 mb-2 uppercase tracking-wider">Role Name</label>
                                    <input
                                        type="text"
                                        name="displayName"
                                        value={formData.displayName}
                                        onChange={handleChange}
                                        placeholder="e.g. Senior Surgeon"
                                        className="w-full px-5 py-4 bg-sky-50 border border-sky-100 rounded-2xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-bold text-sky-950 placeholder:text-sky-300"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-sky-900 mb-2 uppercase tracking-wider">Role Code (Unique)</label>
                                    <input
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleChange}
                                        placeholder="e.g. SURGEON_SR"
                                        className="w-full px-5 py-4 bg-sky-50 border border-sky-100 rounded-2xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-bold text-sky-950 placeholder:text-sky-300"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Meta Info */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-black text-sky-900 mb-2 uppercase tracking-wider">Icon Name (Lucide)</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="icon"
                                            value={formData.icon}
                                            onChange={handleChange}
                                            placeholder="e.g. Stethoscope"
                                            className="w-full px-5 py-4 bg-sky-50 border border-sky-100 rounded-2xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-bold text-sky-950 placeholder:text-sky-300"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-sky-400 bg-white px-2 py-1 rounded-lg border border-sky-100">Optional</span>
                                    </div>
                                </div>

                                <div className="p-6 bg-sky-50/50 rounded-2xl border border-sky-100/50">
                                    <label className="flex items-center gap-4 cursor-pointer group">
                                        <div className="relative flex items-center justify-center">
                                            <input
                                                type="checkbox"
                                                name="isProfessional"
                                                checked={formData.isProfessional}
                                                onChange={handleChange}
                                                className="w-6 h-6 text-sky-600 border-sky-200 rounded-lg focus:ring-sky-500 accent-sky-600"
                                            />
                                        </div>
                                        <div>
                                            <span className="block text-lg font-black text-sky-950 group-hover:text-sky-600 transition-colors">Is Professional?</span>
                                            <span className="text-xs font-medium text-sky-600/70">Check this if the role is a clinical doctor.</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-sky-800">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Briefly describe the responsibilities and access levels for this role..."
                                rows={3}
                                className="w-full px-4 py-3 bg-sky-50/50 border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all resize-none text-sky-900 placeholder-sky-300"
                            />
                        </div>
                    </div>

                    {/* Section 2: Attributes */}
                    <div className="space-y-6">
                        <h2 className="text-lg font-bold text-sky-900 flex items-center gap-2 pb-2 border-b border-sky-100">
                            <Shield className="w-5 h-5 text-sky-600" /> Role Attributes
                        </h2>

                        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-5 flex items-start gap-4 hover:bg-sky-100/50 transition-colors cursor-pointer" onClick={() => setFormData({ ...formData, isProfessional: !formData.isProfessional })}>
                            <div className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.isProfessional ? 'bg-sky-600 border-sky-600' : 'bg-white border-gray-300'}`}>
                                {formData.isProfessional && <Check className="w-4 h-4 text-white" />}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-sky-900">Is Doctor?</h4>
                                <p className="text-sm text-sky-600/70 leading-relaxed max-w-[240px]">
                                    Enable this if the role involves clinical practice and doctor-specific workflows.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-bold text-sky-800">Role Icon</label>
                            <div className="flex flex-wrap gap-3 p-4 bg-sky-50/50 rounded-2xl border border-sky-100">
                                {iconOptions.map((icon) => (
                                    <button
                                        key={icon}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, icon })}
                                        className={`w-12 h-12 text-2xl rounded-xl transition-all flex items-center justify-center ${formData.icon === icon
                                            ? "bg-white shadow-md ring-2 ring-sky-500 scale-110"
                                            : "bg-transparent hover:bg-sky-100/50 grayscale hover:grayscale-0"
                                            }`}
                                    >
                                        {icon}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Action Footer */}
                    <div className="pt-6 flex items-center justify-end gap-4 border-t border-sky-100">
                        <button
                            type="button"
                            onClick={() => navigate("/app/roles")}
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
                                    <Loader2 className="w-5 h-5 animate-spin" /> Creating...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" /> Save Role
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RoleCreate;
