import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { fetchUsers, deleteUser, toggleUser } from "../redux/userSlice";
import { Users, Plus, Edit2, Trash2, Search, Filter, Mail, Shield, CheckCircle2, User, Lock, Unlock } from "lucide-react";

/**
 * UserManagement
 * Reskinned to Sky Blue Theme
 */
const UserManagement = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { users, loading, success } = useSelector((state) => state.users);
    const [searchTerm, setSearchTerm] = useState("");
    const [status, setStatus] = useState("all"); // all, active, inactive

    useEffect(() => {
        dispatch(fetchUsers({ status }));
    }, [dispatch, status]);

    const handleToggleStatus = (id) => {
        dispatch(toggleUser(id));
    };

    const filteredUsers = (users || []).filter(user =>
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.loginId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.roleCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            dispatch(deleteUser(id));
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-sky-950 tracking-tight">Staff Management</h1>
                    <p className="text-sky-700/70 mt-1 text-base sm:text-lg font-medium">Manage your clinic team and their system access.</p>
                </div>
                <Link
                    to="/app/users/create"
                    className="flex items-center justify-center gap-2 px-6 py-3.5 bg-sky-600 text-white rounded-2xl shadow-xl shadow-sky-600/30 hover:bg-sky-700 hover:-translate-y-1 transition-all font-black active:scale-95 group"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    <span>Add Staff</span>
                </Link>
            </div>

            {/* Success/Error Messages */}
            {success && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-xl flex items-center justify-between shadow-sm animate-in slide-in-from-top duration-300">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <p className="font-semibold">{success}</p>
                    </div>
                </div>
            )}

            {/* Filters & Search */}
            <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-sky-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by name, login ID, or role..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-sky-50/50 border border-sky-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all text-sky-900 placeholder-sky-300"
                    />
                </div>

                {/* Filter Chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                    {["all", "active", "inactive"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatus(s)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all whitespace-nowrap border ${status === s
                                ? "bg-sky-600 text-white border-sky-600 shadow-lg shadow-sky-600/20"
                                : "bg-white text-sky-600 border-sky-100 hover:bg-sky-50 hover:border-sky-200"
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                    <button className="p-2 text-sky-400 hover:text-sky-600 rounded-lg hover:bg-sky-50 transition-colors">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-sky-900/5 border border-sky-100 overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left min-w-[900px]">
                        <thead className="bg-sky-50/80 border-b border-sky-100">
                            <tr>
                                <th className="px-8 py-5 text-left text-xs font-bold text-sky-600 uppercase tracking-wider">User Profile</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-sky-600 uppercase tracking-wider">Login ID</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-sky-600 uppercase tracking-wider">Role</th>
                                <th className="px-8 py-5 text-center text-xs font-bold text-sky-600 uppercase tracking-wider">Status</th>
                                <th className="px-8 py-5 text-center text-xs font-bold text-sky-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-sky-50">
                            {filteredUsers.map((user) => (
                                <tr key={user._id} className="hover:bg-sky-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-sky-500/20">
                                                {user.fullName?.[0]?.toUpperCase() || <User className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sky-950 text-base">{user.fullName}</div>
                                                <div className="text-xs text-sky-500 flex items-center gap-1 mt-0.5">
                                                    <span className="opacity-80">Added {new Date(user.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2 text-sky-800 font-mono text-sm">
                                            <Mail className="w-4 h-4 text-sky-300" />
                                            {user.loginId}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-sky-100 text-sky-600 rounded-lg">
                                                <Shield className="w-3 h-3" />
                                            </div>
                                            <span className="font-medium text-sky-900">{user.roleCode}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${user.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                                            {user.isActive && <CheckCircle2 className="w-3 h-3" />}
                                            {user.isActive ? "ACTIVE" : "INACTIVE"}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => navigate(`/app/users/${user._id}/edit`)}
                                                className="p-2 text-sky-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                                                title="Edit User"
                                            >
                                                <Edit2 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(user._id)}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs transition-all border ${user.isActive
                                                    ? "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100"
                                                    : "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
                                                    }`}
                                            >
                                                {user.isActive ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                                                <span>{user.isActive ? "Block" : "Unblock"}</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user._id)}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl font-bold text-xs hover:bg-rose-100 transition-all"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                <span>Delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="5" className="px-8 py-16 text-center text-sky-400">
                                        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p className="text-lg font-medium">No users found matching "{searchTerm}"</p>
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

export default UserManagement;
