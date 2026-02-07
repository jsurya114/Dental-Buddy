import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axios";

const RoleManagement = () => {
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get("/admin/roles");
            setRoles(response.data.roles || []);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch roles");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleToggle = async (id) => {
        try {
            setActionLoading(id);
            await axiosInstance.patch(`/admin/roles/${id}/toggle`);
            await fetchRoles();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to toggle role");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id, displayName) => {
        if (!confirm(`Are you sure you want to delete "${displayName}"?`)) return;
        try {
            setActionLoading(id);
            await axiosInstance.delete(`/admin/roles/${id}`);
            await fetchRoles();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete role");
        } finally {
            setActionLoading(null);
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
                                    <p className="text-xs text-gray-500">Role Management</p>
                                </div>
                            </Link>
                        </div>
                        <Link
                            to="/clinic-admin/dashboard"
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm"
                        >
                            ← Back to Dashboard
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Title Section */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Manage Roles</h2>
                        <p className="text-gray-500">Create and manage user roles for your clinic</p>
                    </div>
                    <button
                        onClick={() => navigate("/clinic-admin/roles/create")}
                        className="px-5 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-cyan-700 transition-all duration-200 shadow-lg flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Role
                    </button>
                </div>

                {/* Error State */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                        {error}
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin"></div>
                    </div>
                ) : roles.length === 0 ? (
                    /* Empty State */
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="text-6xl mb-4">📋</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No Roles Yet</h3>
                        <p className="text-gray-500 mb-6">Create your first role to get started</p>
                        <button
                            onClick={() => navigate("/clinic-admin/roles/create")}
                            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold rounded-xl"
                        >
                            Create First Role
                        </button>
                    </div>
                ) : (
                    /* Roles Table */
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Role</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Code</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Type</th>
                                    <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {roles.map((role) => (
                                    <tr key={role._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{role.icon || "🔐"}</span>
                                                <div>
                                                    <p className="font-semibold text-gray-800">{role.displayName}</p>
                                                    <p className="text-sm text-gray-500">{role.description || "No description"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">{role.code}</code>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${role.isActive
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-100 text-gray-600"
                                                }`}>
                                                {role.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {role.isSystemRole ? (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                                    System
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                    Custom
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                {role.isSystemRole ? (
                                                    <span className="text-xs text-gray-400 italic">Protected</span>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => navigate(`/clinic-admin/roles/edit/${role._id}`)}
                                                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggle(role._id)}
                                                            disabled={actionLoading === role._id}
                                                            className={`p-2 rounded-lg transition-colors ${role.isActive
                                                                    ? "text-gray-500 hover:text-amber-600 hover:bg-amber-50"
                                                                    : "text-gray-500 hover:text-green-600 hover:bg-green-50"
                                                                }`}
                                                            title={role.isActive ? "Disable" : "Enable"}
                                                        >
                                                            {role.isActive ? (
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                                </svg>
                                                            ) : (
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(role._id, role.displayName)}
                                                            disabled={actionLoading === role._id}
                                                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
};

export default RoleManagement;
