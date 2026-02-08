import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import axiosInstance from "../../api/axios";

const PatientSearch = ({ onSelect }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);

    // Debounce search
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.length >= 2) {
                setLoading(true);
                try {
                    const response = await axiosInstance.get("/patients", {
                        params: { search: searchTerm, limit: 5 }
                    });
                    setResults(response.data.data || []);
                    setShowResults(true);
                } catch (error) {
                    console.error("Search failed:", error);
                    setResults([]);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
                setShowResults(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    // Handle outside click to close results
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (patient) => {
        onSelect(patient);
        setSearchTerm("");
        setShowResults(false);
    };

    return (
        <div className="relative" ref={searchRef}>
            <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search patient by name or phone..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 shadow-sm"
                />
                {loading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-500"></div>
                    </div>
                )}
            </div>

            {showResults && results.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto">
                    {results.map((patient) => (
                        <button
                            key={patient._id}
                            onClick={() => handleSelect(patient)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-50 last:border-0"
                        >
                            <div className="w-8 h-8 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center text-sm font-bold">
                                {patient.fullName.charAt(0)}
                            </div>
                            <div>
                                <div className="font-medium text-gray-800">{patient.fullName}</div>
                                <div className="text-xs text-gray-500">
                                    {patient.phone} • {patient.gender} • {patient.age}y
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {showResults && results.length === 0 && searchTerm.length >= 2 && !loading && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-4 text-center text-gray-500 text-sm">
                    No patients found.
                </div>
            )}
        </div>
    );
};

export default PatientSearch;
