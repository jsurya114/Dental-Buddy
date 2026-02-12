import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { fetchPatients } from "../redux/patientSlice";
import { usePermissions } from "../hooks/usePermission";
import {
    Search,
    Plus,
    MoreHorizontal,
    Phone,
    Calendar,
    User as UserIcon,
    Filter
} from "lucide-react";

/**
 * PatientList - Reskinned to Sky Blue Theme
 */
const PatientList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { patients, pagination, loading, error } = useSelector((state) => state.patients);
    const { can } = usePermissions();

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [view, setView] = useState("all"); // all, active, new

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch patients when search, page, or view changes
    useEffect(() => {
        dispatch(fetchPatients({ page: 1, limit: 10, search: debouncedSearch, view }));
    }, [dispatch, debouncedSearch, view]);

    const handlePageChange = (newPage) => {
        dispatch(fetchPatients({ page: newPage, limit: 10, search: debouncedSearch, view }));
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-sky-950 tracking-tight">Patient Directory</h1>
                    <p className="text-sky-700/70 mt-1 text-base sm:text-lg font-medium">Manage and view all registered patients.</p>
                </div>
                {can("PATIENT", "CREATE") && (
                    <Link
                        to="/app/patients/create"
                        className="flex items-center justify-center gap-2 px-6 py-3.5 bg-sky-600 text-white rounded-2xl shadow-xl shadow-sky-600/30 hover:bg-sky-700 hover:-translate-y-1 transition-all font-black active:scale-95 group"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        <span>Add Patient</span>
                    </Link>
                )}
            </div>

            {/* Filters Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-8 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-400 w-5 h-5 group-focus-within:text-sky-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by name, ID or phone..."
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-sky-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-sky-500/10 focus:border-sky-300 outline-none transition-all font-medium text-sky-900 placeholder:text-sky-300"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="lg:col-span-4 flex gap-3">
                    <div className="flex-1 relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-400 w-4 h-4" />
                        <select
                            className="w-full pl-11 pr-4 py-3.5 bg-white border border-sky-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-sky-500/10 focus:border-sky-300 outline-none transition-all font-bold text-sky-700 appearance-none cursor-pointer"
                            value={view}
                            onChange={(e) => setView(e.target.value)}
                        >
                            <option value="all">All Patients</option>
                            <option value="active">Active</option>
                            <option value="new">New</option>
                        </select>
                    </div>
                    <button className="p-3.5 bg-white border border-sky-100 rounded-2xl shadow-sm text-sky-600 hover:bg-sky-50 transition-colors">
                        <Calendar className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm flex items-center gap-2 font-bold shadow-sm">
                    <span className="text-lg">⚠️</span> {error}
                </div>
            )}

            {/* Table Section */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-sky-900/5 border border-sky-100 overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead className="bg-sky-50/80 border-b border-sky-100">
                            <tr>
                                <th className="px-6 md:px-8 py-5 text-xs font-bold text-sky-600 uppercase tracking-wider">Patient</th>
                                <th className="px-6 md:px-8 py-5 text-xs font-bold text-sky-600 uppercase tracking-wider">Contact</th>
                                <th className="px-6 md:px-8 py-5 text-xs font-bold text-sky-600 uppercase tracking-wider">Details</th>
                                <th className="px-6 md:px-8 py-5 text-xs font-bold text-sky-600 uppercase tracking-wider hidden md:table-cell">Registered</th>
                                <th className="px-6 md:px-8 py-5 text-xs font-bold text-sky-600 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-sky-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-16 text-center text-sky-400">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="animate-spin w-8 h-8 border-4 border-sky-200 border-t-sky-600 rounded-full"></div>
                                            <span className="font-medium">Loading patients...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : patients.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-16 text-center text-sky-300">
                                        <div className="flex flex-col items-center gap-3">
                                            <UserIcon className="w-12 h-12 opacity-50" />
                                            <span className="text-lg font-medium text-sky-400">No patients found</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                patients.map((patient) => (
                                    <tr
                                        key={patient._id}
                                        onClick={() => navigate(`/app/patients/${patient._id}`)}
                                        className="group hover:bg-sky-50/50 cursor-pointer transition-colors"
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-sky-200 group-hover:scale-110 transition-transform">
                                                    {patient.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sky-950 group-hover:text-sky-700 transition-colors text-base">
                                                        {patient.fullName}
                                                    </p>
                                                    <p className="text-xs text-sky-500 font-medium bg-sky-50 px-2 py-0.5 rounded-md inline-block mt-1 border border-sky-100">
                                                        ID: {patient.patientId}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-sm text-sky-700">
                                                    <Phone className="w-4 h-4 text-sky-400" />
                                                    <span className="font-medium">{patient.phone}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${patient.gender === 'Male' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                    patient.gender === 'Female' ? 'bg-pink-50 text-pink-700 border-pink-100' :
                                                        'bg-gray-50 text-gray-600 border-gray-100'
                                                    }`}>
                                                    {patient.gender}
                                                </span>
                                                <span className="text-sm font-medium text-sky-600 bg-sky-50 px-2 py-1 rounded-lg border border-sky-100">
                                                    {patient.age} yrs
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 md:px-8 py-5 hidden md:table-cell">
                                            <div className="flex items-center gap-2 text-sm text-sky-600/80 font-medium">
                                                <Calendar className="w-4 h-4 text-sky-300" />
                                                {new Date(patient.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 md:px-8 py-5 text-right">
                                            <button className="p-2 text-sky-300 hover:text-sky-600 hover:bg-sky-100 rounded-lg transition-colors border border-transparent hover:border-sky-200">
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="px-8 py-5 border-t border-sky-100 flex items-center justify-between bg-sky-50/30">
                        <button
                            disabled={pagination.page === 1}
                            onClick={() => handlePageChange(pagination.page - 1)}
                            className="px-4 py-2 text-sm font-bold text-sky-600 bg-white border border-sky-200 rounded-lg hover:bg-sky-50 hover:text-sky-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-sky-700 font-medium">
                            Page <span className="font-bold text-sky-900">{pagination.page}</span> of {pagination.pages}
                        </span>
                        <button
                            disabled={pagination.page === pagination.pages}
                            onClick={() => handlePageChange(pagination.page + 1)}
                            className="px-4 py-2 text-sm font-bold text-sky-600 bg-white border border-sky-200 rounded-lg hover:bg-sky-50 hover:text-sky-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientList;
