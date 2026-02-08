import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createInvoice, clearSuccessMessage, clearError } from "../../redux/billingSlice";

const TREATMENTS = [
    "Consultation",
    "Review",
    "Scaling",
    "Extraction",
    "Surgical Procedure",
    "RCT",
    "Filling",
    "Ortho",
    "FPD",
    "PD",
    "CD",
    "Others"
];

const FinancialBillingForm = ({ patient }) => {
    const dispatch = useDispatch();
    const { actionLoading, error, successMessage } = useSelector(state => state.billing);

    const [formData, setFormData] = useState({
        treatment: "Consultation",
        treatmentCharges: "",
        doctorFees: "",
        labCharges: "",
        otherExpenses: "",
        date: new Date().toISOString().split('T')[0]
    });

    const [calculations, setCalculations] = useState({
        totalExpenses: 0,
        totalProfit: 0
    });

    // Auto Calculate on input change
    useEffect(() => {
        const charges = parseFloat(formData.treatmentCharges) || 0;
        const doc = parseFloat(formData.doctorFees) || 0;
        const lab = parseFloat(formData.labCharges) || 0;
        const other = parseFloat(formData.otherExpenses) || 0;

        const totalExpenses = doc + lab + other;
        const totalProfit = charges - totalExpenses;

        setCalculations({ totalExpenses, totalProfit });
    }, [formData]);

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        await dispatch(createInvoice({
            patientId: patient._id,
            treatmentName: formData.treatment,
            treatmentCharges: parseFloat(formData.treatmentCharges) || 0,
            doctorCharges: parseFloat(formData.doctorFees) || 0,
            labCharges: parseFloat(formData.labCharges) || 0,
            otherCharges: parseFloat(formData.otherExpenses) || 0,
            notes: `Auto-generated from Billing Module. Profit: ${calculations.totalProfit}`
        }));

        // Reset form on success (handled via simple effect here or in redux listener)
        // For simplicity, we stick to success message check
    };

    // Clear success message effect
    useEffect(() => {
        if (successMessage) {
            setFormData({
                treatment: "Consultation",
                treatmentCharges: "",
                doctorFees: "",
                labCharges: "",
                otherExpenses: "",
                date: new Date().toISOString().split('T')[0]
            });
            const timer = setTimeout(() => dispatch(clearSuccessMessage()), 4000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, dispatch]);

    // Clear error
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => dispatch(clearError()), 5000);
            return () => clearTimeout(timer);
        }
    }, [error, dispatch]);


    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span>💰</span> Finance & Billing
            </h3>

            {successMessage && (
                <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl mb-4">
                    ✓ Invoice created successfully!
                </div>
            )}
            {error && (
                <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl mb-4">
                    ✗ {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Row 1: Date & Patient */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Date</label>
                        <input
                            type="date"
                            disabled
                            value={formData.date}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Patient Name</label>
                        <input
                            type="text"
                            value={patient.fullName}
                            disabled
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed font-medium"
                        />
                    </div>
                </div>

                {/* Row 2: Treatment Dropdown */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Treatment Done</label>
                    <select
                        value={formData.treatment}
                        onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow"
                    >
                        {TREATMENTS.map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>

                <div className="border-t border-gray-100 my-4"></div>

                {/* Section: Charges */}
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Charges Breakdown</h4>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Treatment Charges (Revenue)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                            <input
                                type="number"
                                min="0"
                                value={formData.treatmentCharges}
                                onChange={(e) => setFormData({ ...formData, treatmentCharges: e.target.value })}
                                className="w-full pl-7 pr-3 py-2 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500 bg-teal-50/30"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Doctor's Consultation Fee</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                            <input
                                type="number"
                                min="0"
                                value={formData.doctorFees}
                                onChange={(e) => setFormData({ ...formData, doctorFees: e.target.value })}
                                className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Lab Charges</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                            <input
                                type="number"
                                min="0"
                                value={formData.labCharges}
                                onChange={(e) => setFormData({ ...formData, labCharges: e.target.value })}
                                className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Other Expenses</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                            <input
                                type="number"
                                min="0"
                                value={formData.otherExpenses}
                                onChange={(e) => setFormData({ ...formData, otherExpenses: e.target.value })}
                                className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                </div>

                {/* Calculations Display */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                        <span>Total Expenses (Dr + Lab + Other):</span>
                        <span>₹{calculations.totalExpenses.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-200">
                        <span className="text-gray-800">Total Profit:</span>
                        <span className={calculations.totalProfit >= 0 ? "text-green-600" : "text-red-500"}>
                            ₹{calculations.totalProfit.toFixed(2)}
                        </span>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full py-3 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-xl font-bold shadow-md hover:shadow-lg disabled:opacity-50 transition-all"
                >
                    {actionLoading ? "Saving..." : "Save Record (Create Invoice)"}
                </button>

            </form>
        </div>
    );
};

export default FinancialBillingForm;
