import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { fetchPatients } from "../redux/patientSlice";
import { usePermissions } from "../hooks/usePermission";

const PatientList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { patients, pagination, loading, error } = useSelector((state) => state.patients);
    const { can } = usePermissions();

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch patients when search or page changes
    useEffect(() => {
        dispatch(fetchPatients({ page: 1, limit: 10, search: debouncedSearch }));
    }, [dispatch, debouncedSearch]);

    const handlePageChange = (newPage) => {
        dispatch(fetchPatients({ page: newPage, limit: 10, search: debouncedSearch }));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Patients</h1>
                    <p className="text-gray-500">Manage patient records</p>
                </div>
                {can("PATIENT", "CREATE") && (
                    <Link
                        to="/app/patients/create"
                        className="bg-teal-600 text-white px-4 py-2 rounded-xl hover:bg-teal-700 transition-colors flex items-center gap-2"
                    >
                        <span>➕</span> Add Patient
                    </Link>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                    <input
                        type="text"
                        placeholder="Search by name, phone, or patient ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {/* Table */}
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-700">
                        <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
                            <tr>
                                <th className="px-6 py-4">Patient ID</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Phone</th>
                                <th className="px-6 py-4">Age / Gender</th>
                                <th className="px-6 py-4">Registered</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        Loading patients...
                                    </td>
                                </tr>
                            ) : patients.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        No patients found.
                                    </td>
                                </tr>
                            ) : (
                                patients.map((patient) => (
                                    <tr
                                        key={patient._id}
                                        onClick={() => navigate(`/app/patients/${patient._id}`)}
                                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                                    >
                                        <td className="px-6 py-4 font-medium text-teal-600">
                                            {patient.patientId}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-800">
                                            {patient.fullName}
                                        </td>
                                        <td className="px-6 py-4">{patient.phone}</td>
                                        <td className="px-6 py-4">
                                            {patient.age} / {patient.gender}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(patient.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-gray-400 hover:text-teal-600 transition-colors">
                                                ➜
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
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <button
                            disabled={pagination.page === 1}
                            onClick={() => handlePageChange(pagination.page - 1)}
                            className="px-3 py-1 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-500">
                            Page {pagination.page} of {pagination.pages}
                        </span>
                        <button
                            disabled={pagination.page === pagination.pages}
                            onClick={() => handlePageChange(pagination.page + 1)}
                            className="px-3 py-1 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
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
