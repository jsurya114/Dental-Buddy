import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";
import {
    UserCog, Stethoscope, Users, Monitor, ShieldCheck,
    ChevronRight, Loader2, AlertCircle
} from "lucide-react";

// Map role codes to icons for a visual touch
const ROLE_ICONS = {
    "CLINIC_ADMIN": ShieldCheck,
    "DOCTOR": Stethoscope,
    "FRONT_DESK": Monitor,
    "PATIENT": Users,
    "SUPER_ADMIN": UserCog
};

const RoleSelection = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await axiosInstance.get("/public/roles");
                setRoles(response.data.roles || []);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch roles:", err);
                setError("Unable to load roles. Please try again.");
                setRoles([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRoles();
    }, []);

    const handleRoleClick = (role) => {
        if (!role || !role.code) return;
        const roleSlug = role.code.toLowerCase().replace(/_/g, "-");
        navigate(`/login/${roleSlug}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-sky-50">
                <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
                    </div>
                    <p className="text-slate-500 font-medium tracking-wide text-sm uppercase">Initializing System...</p>
                </div>
            </div>
        );
    }

    if (error || !roles.length) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-10 text-center max-w-md w-full animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-red-50/50">
                        <AlertCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Connection Error</h1>
                    <p className="text-slate-500 mb-8 leading-relaxed">
                        {error || "We couldn't load the available roles. Please checking your connection."}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 hover:shadow-lg transition-all active:scale-95"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-sky-50/30 to-slate-100 p-6 relative overflow-hidden">

            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-sky-200/20 rounded-full blur-3xl animate-pulse delay-700"></div>
                <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] bg-sky-200/20 rounded-full blur-3xl animate-pulse"></div>
            </div>

            <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">

                {/* Header */}
                <div className="text-center mb-10 sm:mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700 px-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-sky-500 to-sky-600 rounded-3xl mb-6 shadow-xl shadow-sky-500/20 transform hover:rotate-6 transition-transform duration-500">
                        <span className="text-3xl sm:text-4xl">🦷</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 mb-4 tracking-tight">
                        Dental<span className="text-sky-600">Buddy</span>
                    </h1>
                    <p className="text-slate-500 text-base sm:text-lg md:text-xl max-w-lg mx-auto leading-relaxed px-2">
                        Select your portal to securely access the clinical management system.
                    </p>
                </div>

                {/* Role Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full px-4 md:px-0">
                    {roles.map((role, idx) => {
                        const Icon = ROLE_ICONS[role.code] || ShieldCheck;
                        return (
                            <button
                                key={role.code}
                                onClick={() => handleRoleClick(role)}
                                className="group relative bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-sky-500/10 hover:-translate-y-2 hover:border-sky-100 transition-all duration-300 text-left flex flex-col items-start h-full"
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="w-8 h-8 bg-sky-50 rounded-full flex items-center justify-center text-sky-600">
                                        <ChevronRight className="w-5 h-5" />
                                    </div>
                                </div>

                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-gradient-to-br group-hover:from-sky-500 group-hover:to-sky-600 group-hover:text-white transition-all duration-300 text-slate-600">
                                    <Icon className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" />
                                </div>

                                <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-sky-700 transition-colors">
                                    {role.displayName}
                                </h3>
                                <p className="text-slate-500 text-sm leading-relaxed mb-4 flex-1">
                                    {role.description || `Login portal for ${role.displayName.toLowerCase()}s.`}
                                </p>

                                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mt-auto">
                                    <div className="h-full bg-sky-500 w-0 group-hover:w-full transition-all duration-500 ease-out"></div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <p className="mt-16 text-slate-400 text-sm font-medium flex items-center gap-2 animate-in fade-in duration-1000">
                    <ShieldCheck className="w-4 h-4" />
                    Secure Clinical Environment
                </p>
            </div>
        </div>
    );
};

export default RoleSelection;
