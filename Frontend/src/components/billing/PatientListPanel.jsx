import { useState, useEffect } from "react";
import { Search, User, ChevronRight, Loader2 } from "lucide-react";
import axiosInstance from "../../api/axios";

const PatientListPanel = ({ selectedPatientId, onSelectPatient }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Initial fetch
    useEffect(() => {
        // Reset and fetch when component mounts
        setPatients([]);
        setPage(1);
        setHasMore(true);
        fetchPatients(1, "");
    }, []);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            setPatients([]);
            setPage(1);
            setHasMore(true);
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

            setPatients(prev => pageNum === 1 ? newPatients : [...prev, ...newPatients]);
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
        <div className="flex flex-col h-full bg-white border-r border-sky-100 shadow-[4px_0_24px_-12px_rgba(14,165,233,0.1)] z-10 w-80 md:w-96 shrink-0 transition-all duration-300">
            {/* Header */}
            <div className="p-6 border-b border-sky-100 bg-white sticky top-0 z-10">
                <h3 className="text-xl font-bold text-sky-950 mb-4 tracking-tight">Select Patient</h3>
                <div className="relative group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400 w-4 h-4 group-focus-within:text-sky-600 transition-colors" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name or ID..."
                        className="w-full pl-10 pr-4 py-3 bg-white border border-sky-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all placeholder:text-sky-400 text-sky-900 font-bold shadow-sm"
                    />
                </div>
            </div>

            {/* List */}
            <div
                className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-sky-100 scrollbar-track-transparent hover:scrollbar-thumb-sky-200"
                onScroll={handleScroll}
            >
                {patients.length === 0 && !loading ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center text-sky-300 animate-in fade-in duration-300">
                        <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center mb-3">
                            <User className="w-8 h-8 opacity-50" />
                        </div>
                        <p className="text-sm font-bold text-sky-400">No patients found</p>
                        <p className="text-xs text-sky-300 mt-1">Try adjusting your search</p>
                    </div>
                ) : (
                    <div className="p-3 space-y-2">
                        {patients.map(patient => {
                            const isSelected = selectedPatientId === patient._id;
                            return (
                                <button
                                    key={patient._id}
                                    onClick={() => onSelectPatient(patient)}
                                    className={`w-full text-left p-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isSelected
                                        ? "bg-sky-50 border border-sky-200 shadow-sm"
                                        : "hover:bg-sky-50/50 border border-transparent hover:border-sky-100"
                                        }`}
                                >
                                    <div className="flex items-center gap-3 relative z-10">
                                        {/* Avatar */}
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm transition-transform group-hover:scale-105 shrink-0 ${isSelected
                                            ? "bg-gradient-to-br from-sky-500 to-blue-600 text-white"
                                            : "bg-sky-100 text-sky-500 group-hover:bg-sky-200"
                                            }`}>
                                            {patient.fullName.charAt(0)}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <h4 className={`font-bold text-sm truncate transition-colors ${isSelected ? "text-sky-950" : "text-sky-900"
                                                    }`}>
                                                    {patient.fullName}
                                                </h4>
                                                {/* Status Indicator */}
                                                {(patient.totalDue > 0) && (
                                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"></span>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5 text-xs text-sky-500/80 font-medium">
                                                    <span className="font-mono bg-white/50 px-1.5 py-0.5 rounded border border-sky-100">{patient.patientId}</span>
                                                    <span className="w-0.5 h-0.5 rounded-full bg-sky-300"></span>
                                                    <span className="truncate">{patient.phone}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Arrow for selected state */}
                                        {isSelected && (
                                            <ChevronRight className="w-5 h-5 text-sky-500 animate-in slide-in-from-left-2 fade-in" />
                                        )}
                                    </div>
                                </button>
                            );
                        })}

                        {loading && (
                            <div className="p-6 flex justify-center">
                                <Loader2 className="w-6 h-6 text-sky-500 animate-spin" />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientListPanel;
