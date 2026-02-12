import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axiosInstance from "../api/axios";
import BillingWorkspace from "../components/billing/BillingWorkspace";
import { ChevronLeft, FileText, AlertCircle } from "lucide-react";

const BillingCreate = () => {
    const { patientId } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPatientDetails = async () => {
            try {
                const response = await axiosInstance.get(`/patients/${patientId}`);
                setPatient(response.data.data || response.data.patient || response.data);
            } catch (err) {
                console.error("Error fetching patient:", err);
                setError("Failed to load patient details.");
            } finally {
                setLoading(false);
            }
        };

        if (patientId) {
            fetchPatientDetails();
        }
    }, [patientId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <div className="animate-spin w-10 h-10 border-4 border-sky-200 border-t-sky-600 rounded-full"></div>
            </div>
        );
    }

    if (error || !patient) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center p-6 animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm border border-rose-100">
                    <AlertCircle className="w-10 h-10 text-rose-500" />
                </div>
                <h2 className="text-2xl font-bold text-sky-950 mb-3">Patient Not Found</h2>
                <p className="text-sky-600 mb-8 max-w-sm font-medium">{error || "The requested patient record could not be accessed."}</p>
                <button
                    onClick={() => navigate("/app/billing")}
                    className="px-8 py-3 bg-sky-600 text-white rounded-xl shadow-lg shadow-sky-600/20 hover:bg-sky-700 hover:shadow-xl transition-all font-bold active:scale-95"
                >
                    Back to Billing
                </button>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4 py-2">
                <button
                    onClick={() => navigate("/app/billing")}
                    className="p-2 hover:bg-sky-50/50 hover:text-sky-600 rounded-xl text-sky-400 transition-all border border-transparent hover:border-sky-100"
                    title="Back to Patient List"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-sky-950 tracking-tight flex items-center gap-3">
                        <span className="p-2 bg-sky-100 rounded-lg text-sky-600">
                            <FileText className="w-6 h-6" />
                        </span>
                        Invoice for <span className="text-sky-700">{patient.firstName} {patient.lastName}</span>
                    </h1>
                </div>
            </div>

            {/* Billing Workspace Container */}
            <div className="flex-1 bg-white rounded-[2.5rem] shadow-xl shadow-sky-900/5 border border-sky-100 overflow-hidden">
                <BillingWorkspace patient={patient} />
            </div>
        </div>
    );
};

export default BillingCreate;
