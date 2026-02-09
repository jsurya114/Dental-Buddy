import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../../api/axios";

const PatientListPanel = ({ selectedPatientId, onSelectPatient }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Initial fetch
    useEffect(() => {
        fetchPatients(1, "");
    }, []);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPatients(1, searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchPatients = async (pageNum, search) => {
        setLoading(true);
        try {
            const response = await axiosInstance.get("/patients", {
                params: { page: pageNum, limit: 20, search }
            });
            const newPatients = response.data.data || [];

            if (pageNum === 1) {
                setPatients(newPatients);
            } else {
                setPatients(prev => [...prev, ...newPatients]);
            }

            setHasMore(newPatients.length === 20);
            setPage(pageNum);
        } catch (error) {
            console.error("Failed to fetch patients:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleScroll = (e) => {
        const { scrollTop, clientHeight, scrollHeight } = e.target;
        if (scrollHeight - scrollTop <= clientHeight + 50 && !loading && hasMore) {
            fetchPatients(page + 1, searchTerm);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Search Header */}
            <div className="p-4 border-b border-gray-100">
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search patients..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                </div>
            </div>

            {/* Patient List */}
            <div
                className="flex-1 overflow-y-auto"
                onScroll={handleScroll}
            >
                {patients.length === 0 && !loading ? (
                    <div className="p-8 text-center text-gray-400">
                        No patients found.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {patients.map(patient => (
                            <button
                                key={patient._id}
                                onClick={() => onSelectPatient(patient)}
                                className={`w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-center gap-3 ${selectedPatientId === patient._id ? "bg-teal-50 hover:bg-teal-50 border-l-4 border-teal-500" : "border-l-4 border-transparent"
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${selectedPatientId === patient._id ? "bg-teal-200 text-teal-800" : "bg-gray-100 text-gray-600"
                                    }`}>
                                    {patient.fullName.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className={`font-medium truncate ${selectedPatientId === patient._id ? "text-teal-900" : "text-gray-900"
                                            }`}>
                                            {patient.fullName}
                                        </h4>
                                        {patient.totalDue > 0 ? (
                                            <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ml-2">
                                                Due: ₹{patient.totalDue}
                                            </span>
                                        ) : patient.status === "PAID" ? (
                                            <span className="bg-green-100 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ml-2">
                                                Paid
                                            </span>
                                        ) : null}
                                    </div>
                                    <p className="text-xs text-gray-500 truncate mt-0.5">
                                        ID: {patient.patientId} • {patient.phone}
                                    </p>
                                </div>
                            </button>
                        ))}
                        {loading && (
                            <div className="p-4 text-center">
                                <div className="inline-block w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientListPanel;
