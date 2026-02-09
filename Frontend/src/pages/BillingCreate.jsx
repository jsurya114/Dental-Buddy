import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axiosInstance from "../api/axios";
import BillingWorkspace from "../components/billing/BillingWorkspace";

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
                // API might return { success: true, data: patient } or just patient
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
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    if (error || !patient) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-6">
                <div className="text-red-500 text-5xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Patient Not Found</h2>
                <p className="text-gray-500 mb-6">{error || "The patient you requested could not be found."}</p>
                <button
                    onClick={() => navigate("/app/billing")}
                    className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                    Back to Billing
                </button>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-64px)] overflow-hidden bg-gray-50">
            {/* Back Button Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4">
                <button
                    onClick={() => navigate("/app/billing")}
                    className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                    title="Back to Patient List"
                >
                    ⬅️
                </button>
                <h1 className="text-lg font-bold text-gray-800">New Invoice</h1>
            </div>

            {/* Billing Workspace */}
            <div className="h-[calc(100%-60px)]">
                <BillingWorkspace patient={patient} />
            </div>
        </div>
    );
};

export default BillingCreate;
