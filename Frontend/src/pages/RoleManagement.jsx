import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { fetchRoles, toggleRole, deleteRole } from "../redux/roleSlice";
import { Shield, Plus, Edit2, Trash2, Search, Filter, Ban, Lock, Unlock } from "lucide-react";

/**
 * RoleManagement
 * Reskinned to Sky Blue Theme
 */
const RoleManagement = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { roles, loading, error, success } = useSelector((state) => state.roles);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        dispatch(fetchRoles());
    }, [dispatch]);

    const handleToggleStatus = (id) => {
        dispatch(toggleRole(id));
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this role permanently?")) {
            dispatch(deleteRole(id));
        }
    };

    const filteredRoles = roles.filter(role =>
        role.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-sky-950 tracking-tight">Role Management</h1>
                    <p className="text-sky-700/70 mt-1 text-base sm:text-lg font-medium">Define access levels and staff permissions.</p>
                </div>
                <Link
                    to="/app/roles/create"
                    className="flex items-center justify-center gap-2 px-6 py-3.5 bg-sky-600 text-white rounded-2xl shadow-xl shadow-sky-600/30 hover:bg-sky-700 hover:-translate-y-1 transition-all font-black active:scale-95 group"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    <span>Create Role</span>
                </Link>
            </div>

            {/* Success/Error Messages */}
            {success && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-xl flex items-center justify-between shadow-sm animate-in slide-in-from-top duration-300">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                            <Shield className="w-4 h-4" />
                        </div>
                        <p className="font-semibold">{success}</p>
                    </div>
                </div>
            )}

            {/* Filters & Search */}
            <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-sky-100 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search roles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-sky-50/50 border border-sky-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all text-sky-900 placeholder-sky-300"
                    />
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-sky-50 text-sky-700 border border-sky-100 rounded-xl hover:bg-sky-100 transition-all font-semibold">
                    <Filter className="w-5 h-5" /> Filter
                </button>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-sky-900/5 border border-sky-100 overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left min-w-[900px]">
                        <thead className="bg-sky-50/80 border-b border-sky-100">
                            <tr>
                                <th className="px-8 py-5 text-left text-xs font-bold text-sky-600 uppercase tracking-wider">Role Name</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-sky-600 uppercase tracking-wider">Code</th>
                                <th className="px-8 py-5 text-center text-xs font-bold text-sky-600 uppercase tracking-wider">Status</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-sky-600 uppercase tracking-wider">Description</th>
                                <th className="px-8 py-5 text-center text-xs font-bold text-sky-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-sky-50">
                            {filteredRoles.map((role) => (
                                <tr key={role._id} className="hover:bg-sky-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-sky-600 group-hover:text-white transition-all duration-300">
                                                {role.icon || <Shield className="w-5 h-5" />}
                                            </div>
                                            <span className="font-bold text-sky-950 text-base">{role.displayName}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <code className="px-3 py-1 bg-sky-50 border border-sky-100 rounded-lg text-sky-700 font-mono text-sm">
                                            {role.code}
                                        </code>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${role.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                                            {role.isActive ? "ACTIVE" : "INACTIVE"}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-sky-600/80 text-sm max-w-xs truncate">
                                        {role.description || "No description provided."}
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => navigate(`/app/roles/${role._id}/edit`)}
                                                className="p-2 text-sky-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                                                title="Edit Role"
                                            >
                                                <Edit2 className="w-5 h-5" />
                                            </button>
                                            {!role.isSystemRole && (
                                                <>
                                                    <button
                                                        onClick={() => handleToggleStatus(role._id)}
                                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs transition-all border ${role.isActive
                                                            ? "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100"
                                                            : "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
                                                            }`}
                                                    >
                                                        {role.isActive ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                                                        <span>{role.isActive ? "Block" : "Unblock"}</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(role._id)}
                                                        className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl font-bold text-xs hover:bg-rose-100 transition-all"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        <span>Delete</span>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredRoles.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="5" className="px-8 py-16 text-center text-sky-400">
                                        <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p className="text-lg font-medium">No roles found matching "{searchTerm}"</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RoleManagement;
