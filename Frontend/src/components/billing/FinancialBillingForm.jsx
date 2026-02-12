import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createInvoice, clearSuccessMessage, clearError } from "../../redux/billingSlice";
import { deactivatePatient } from "../../redux/patientSlice";
import { usePermissions } from "../../hooks/usePermission";
import { Loader2, Calculator, CheckCircle2, AlertCircle, Save, Stethoscope, DollarSign, Edit, UserX } from "lucide-react";

const TREATMENTS = [
    "Consultation", "Scaling", "Filling", "Root Canal", "Extraction", "Crown",
    "Bridge", "Denture", "Implant", "Braces", "Whitening", "X-Ray",
    "FPD", "PD", "CD", "Others"
];

const FinancialBillingForm = ({ patient, totalDue = 0 }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { can } = usePermissions();
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

    const [validationErrors, setValidationErrors] = useState({});

    // Auto Calculate on input change
    useEffect(() => {
        const charges = parseFloat(formData.treatmentCharges) || 0;
        const doc = parseFloat(formData.doctorFees) || 0;
        const lab = parseFloat(formData.labCharges) || 0;
        const other = parseFloat(formData.otherExpenses) || 0;

        const totalExpenses = doc + lab + other;
        const totalProfit = charges - totalExpenses;

        setCalculations({ totalExpenses, totalProfit });

        // Clear error when user types
        if (validationErrors.treatmentCharges && charges > 0) {
            setValidationErrors(prev => ({ ...prev, treatmentCharges: null }));
        }
    }, [formData, validationErrors]);

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        const charges = parseFloat(formData.treatmentCharges) || 0;

        // Validation
        const errors = {};
        if (charges <= 0) {
            errors.treatmentCharges = "Treatment charges must be greater than 0";
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        await dispatch(createInvoice({
            patientId: patient._id,
            treatmentName: formData.treatment,
            treatmentCharges: charges,
            doctorCharges: parseFloat(formData.doctorFees) || 0,
            labCharges: parseFloat(formData.labCharges) || 0,
            otherCharges: parseFloat(formData.otherExpenses) || 0,
            notes: `Auto-generated from Billing Module. Profit: ${calculations.totalProfit}`
        }));
    };

    const handleBlock = async () => {
        if (window.confirm(`Are you sure you want to ${patient.active ? 'block' : 'unblock'} this patient?`)) {
            await dispatch(deactivatePatient(patient._id));
            navigate("/app/patients");
        }
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
            setValidationErrors({});
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
        <div className="bg-white p-5">
            {/* Integrated Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-6 border-b border-sky-100 pb-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-sky-400 to-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-sky-500/20 shrink-0">
                        {patient.fullName.charAt(0)}
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xl font-bold text-sky-950 leading-tight">{patient.fullName}</h3>
                            {!patient.active && (
                                <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-[10px] font-black uppercase rounded-full border border-rose-200">Blocked</span>
                            )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-sky-600/80 mt-1.5 font-bold">
                            <span className="font-mono bg-sky-50 px-2 py-0.5 rounded text-sky-700 border border-sky-100">#{patient.patientId}</span>
                            <span className="w-1 h-1 rounded-full bg-sky-200"></span>
                            <span>{patient.phone}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3">
                    <div className="flex items-center gap-1.5 order-2 sm:order-1">
                        {/* Edit Button */}
                        {can("PATIENT", "EDIT") && (
                            <button
                                onClick={() => navigate(`/app/patients/${patient._id}/edit`)}
                                className="p-1.5 text-sky-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                                title="Edit Patient"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                        )}
                        {/* Block/Delete Button */}
                        {can("PATIENT", "DELETE") && (
                            <button
                                onClick={handleBlock}
                                className="p-1.5 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title={patient.active ? "Block Patient" : "Unblock Patient"}
                            >
                                <UserX className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-0.5">Total Due</div>
                        <div className="font-bold text-xl text-rose-600 leading-none">
                            ₹{totalDue.toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>

            {successMessage && (
                <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg mb-4 flex items-center gap-2 animate-in fade-in border border-emerald-100 shadow-sm text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-bold">Invoice created successfully!</span>
                </div>
            )}
            {error && (
                <div className="bg-rose-50 text-rose-700 px-4 py-2 rounded-lg mb-4 flex items-center gap-2 animate-in fade-in border border-rose-100 shadow-sm text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-bold">{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

                {/* Top Row: Date & Treatment */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-sky-400 uppercase tracking-wider mb-1 ml-1">Date</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-sky-200 rounded-lg text-sky-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-bold text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-sky-400 uppercase tracking-wider mb-1 ml-1">Treatment</label>
                        <div className="relative">
                            <select
                                value={formData.treatment}
                                onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-sky-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all appearance-none font-bold text-sky-900 cursor-pointer hover:bg-sky-50/30 text-sm"
                            >
                                {TREATMENTS.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-sky-400">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-sky-100 my-1"></div>

                {/* Financial Breakdown */}
                <div>
                    <h4 className="text-xs font-bold text-sky-900 mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                        <DollarSign className="w-3 h-3 text-sky-500" />
                        Financials
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-sky-500 mb-1 ml-1 uppercase">Charges (₹)</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.treatmentCharges}
                                onChange={(e) => setFormData({ ...formData, treatmentCharges: e.target.value })}
                                className={`w-full px-3 py-2 bg-sky-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-sky-900 placeholder-sky-300 font-bold text-sm ${validationErrors.treatmentCharges ? 'border-rose-300 focus:border-rose-500' : 'border-sky-200 focus:border-sky-500'}`}
                                placeholder="0"
                            />
                            {validationErrors.treatmentCharges && (
                                <p className="mt-0.5 text-[10px] text-rose-500 font-bold flex items-center gap-0.5 absolute">
                                    <AlertCircle className="w-2.5 h-2.5" /> Required
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-sky-400 mb-1 ml-1 uppercase">Doc Fees</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.doctorFees}
                                onChange={(e) => setFormData({ ...formData, doctorFees: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-sky-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-bold text-sky-900 placeholder-sky-200 text-sm"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-sky-400 mb-1 ml-1 uppercase">Lab</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.labCharges}
                                onChange={(e) => setFormData({ ...formData, labCharges: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-sky-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-bold text-sky-900 placeholder-sky-200 text-sm"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-sky-400 mb-1 ml-1 uppercase">Other</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.otherExpenses}
                                onChange={(e) => setFormData({ ...formData, otherExpenses: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-sky-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-bold text-sky-900 placeholder-sky-200 text-sm"
                                placeholder="0"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer: Calculations & Save */}
                <div className="flex flex-col sm:flex-row gap-4 items-center pt-2">
                    <div className="flex-1 w-full bg-sky-50/50 rounded-xl px-4 py-2 border border-sky-100 flex items-center justify-between">
                        <div className="text-xs text-sky-600 font-bold">
                            Exp: <span className="text-sky-800">₹{calculations.totalExpenses}</span>
                        </div>
                        <div className="text-sm font-bold text-sky-950 flex items-center gap-2">
                            Profit:
                            <span className={`${calculations.totalProfit >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                                ₹{calculations.totalProfit.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={actionLoading}
                        className="w-full sm:w-auto px-8 py-2.5 bg-sky-600 text-white rounded-xl font-bold shadow-lg shadow-sky-600/20 hover:bg-sky-700 hover:shadow-xl hover:shadow-sky-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
                    >
                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {actionLoading ? "Saving..." : "Save Invoice"}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default FinancialBillingForm;
