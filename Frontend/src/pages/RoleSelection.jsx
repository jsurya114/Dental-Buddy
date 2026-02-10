import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";

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
                setError("Failed to load roles");
                setRoles([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRoles();
    }, []);

    const handleRoleClick = (role) => {
        if (!role || !role.code) {
            console.error("Invalid role data:", role);
            return;
        }
        // Convert role code to URL-friendly format: CLINIC_ADMIN -> clinic-admin
        const roleSlug = role.code.toLowerCase().replace(/_/g, "-");
        navigate(`/login/${roleSlug}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
                    <p className="text-gray-500 text-lg">Loading roles...</p>
                </div>
            </div>
        );
    }

    if (error || !roles.length) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center max-w-md">
                    <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">No Roles Available</h1>
                    <p className="text-gray-500 mb-6">
                        {error || "No roles have been configured yet. Please contact the administrator."}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-all duration-200"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">

            {/* Logo Section */}
            <div className="relative text-center mb-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-teal-600 rounded-3xl mb-6 shadow-xl">
                    <span className="text-4xl text-white">🦷</span>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Dental Buddy</h1>
                <p className="text-gray-500 text-lg">Select your role to continue</p>
            </div>

            {/* Role Cards Grid */}
            <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl w-full">
                {roles.map((role) => (
                    <div
                        key={role.code}
                        onClick={() => handleRoleClick(role)}
                        className="group cursor-pointer bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col items-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                        <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                            <span className="text-3xl">{role.icon || "🔐"}</span>
                        </div>
                        <h2 className="text-lg font-bold text-gray-800 mb-1">{role.displayName}</h2>
                        <p className="text-sm text-gray-500 text-center">{role.description || "Click to login"}</p>
                        <div className="mt-4 flex items-center text-teal-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <span>Continue</span>
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <p className="relative mt-12 text-gray-400 text-sm">
                <span className="text-gray-600 font-medium">Dental Buddy</span>
            </p>
        </div>
    );
};

export default RoleSelection;
