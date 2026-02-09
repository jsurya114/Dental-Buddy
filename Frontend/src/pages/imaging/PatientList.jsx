import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchPatients } from "../../redux/patientSlice";

const PatientList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { patients, loading } = useSelector((state) => state.patients);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        dispatch(fetchPatients());
    }, [dispatch]);

    const filteredPatients = patients ? patients.filter(patient =>
        patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm) ||
        patient.patientId.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Imaging & Documents</h1>
                    <p className="text-teal-100 text-lg">Select a patient to view or upload imaging files</p>
                </div>
            </div>

            {/* Search & List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <div className="relative max-w-md">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
                        <input
                            type="text"
                            placeholder="Search by name, phone, or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-teal-500 transition-all"
                        />
                    </div>
                </div>

                <div className="divide-y divide-gray-50">
                    {loading ? (
                        <div className="p-12 text-center text-gray-500">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
                            Loading patients...
                        </div>
                    ) : filteredPatients.length > 0 ? (
                        filteredPatients.map((patient) => (
                            <div
                                key={patient._id}
                                onClick={() => navigate(`/app/imaging/${patient._id}`)}
                                className="p-4 hover:bg-teal-50 transition-colors cursor-pointer group flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl group-hover:bg-white group-hover:shadow-sm transition-all">
                                        {patient.gender === "Female" ? "👩" : "👨"}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 group-hover:text-teal-700 transition-colors">
                                            {patient.fullName}
                                        </h3>
                                        <p className="text-sm text-gray-500 flex items-center gap-2">
                                            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                                                {patient.patientId}
                                            </span>
                                            {patient.phone}
                                        </p>
                                    </div>
                                </div>
                                <button className="px-4 py-2 bg-white text-teal-600 border border-teal-100 rounded-lg hover:bg-teal-500 hover:text-white transition-all text-sm font-medium opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0">
                                    View Imaging →
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center text-gray-400">
                            No patients found matching "{searchTerm}"
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientList;
