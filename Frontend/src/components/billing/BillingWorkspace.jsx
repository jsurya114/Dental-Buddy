import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import FinancialBillingForm from "./FinancialBillingForm";
import { fetchInvoices, fetchPayments, addPayment, toggleDoctorPayment, clearSuccessMessage, clearError } from "../../redux/billingSlice";
import { usePermissions } from "../../hooks/usePermission";

// Simple Payment Modal Component
const PaymentModal = ({ invoice, onClose, onSave }) => {
    const [amount, setAmount] = useState(invoice.totalAmount - invoice.paidAmount);
    const [mode, setMode] = useState("CASH");
    const [notes, setNotes] = useState("");
    const [reference, setReference] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            invoiceId: invoice._id,
            amount: Number(amount),
            mode,
            reference,
            notes
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Record Payment</h3>
                <div className="mb-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <p>Invoice: <span className="font-semibold">{invoice.invoiceNumber}</span></p>
                    <p>Total: ₹{invoice.totalAmount}</p>
                    <p>Balance Due: <span className="text-red-500 font-bold">₹{(invoice.totalAmount - invoice.paidAmount).toFixed(2)}</span></p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                            <input
                                type="number"
                                required
                                min="1"
                                max={invoice.totalAmount - invoice.paidAmount}
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                        <select
                            value={mode}
                            onChange={e => setMode(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        >
                            <option value="CASH">Cash</option>
                            <option value="CARD">Card</option>
                            <option value="UPI">UPI</option>
                            <option value="BANK_TRANSFER">Bank Transfer</option>
                            <option value="CHEQUE">Cheque</option>
                        </select>
                    </div>

                    {mode !== "CASH" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reference No. / Transaction ID</label>
                            <input
                                type="text"
                                value={reference}
                                onChange={e => setReference(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                placeholder="Optional"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            rows="2"
                            placeholder="Optional remarks"
                        ></textarea>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-md"
                        >
                            Confirm Payment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const BillingWorkspace = ({ patient }) => {
    const dispatch = useDispatch();
    const { invoices, loading, actionLoading, successMessage, error } = useSelector(state => state.billing);
    const { can } = usePermissions();
    const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);

    useEffect(() => {
        if (patient) {
            dispatch(fetchInvoices(patient._id));
            dispatch(fetchPayments(patient._id));
        }
    }, [dispatch, patient]);

    // Clear messages
    useEffect(() => {
        if (successMessage || error) {
            const timer = setTimeout(() => {
                if (successMessage) dispatch(clearSuccessMessage());
                if (error) dispatch(clearError());
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, error, dispatch]);

    const handlePaymentSave = async (paymentData) => {
        await dispatch(addPayment(paymentData));
        setSelectedInvoiceForPayment(null);
        // Refresh invoices to update status
        dispatch(fetchInvoices(patient._id));
    };

    const handleToggleDoctorPayment = async (invoiceId) => {
        await dispatch(toggleDoctorPayment(invoiceId));
    };

    if (!patient) return null;

    return (
        <div className="h-full flex flex-col bg-gray-50 relative">
            {selectedInvoiceForPayment && (
                <PaymentModal
                    invoice={selectedInvoiceForPayment}
                    onClose={() => setSelectedInvoiceForPayment(null)}
                    onSave={handlePaymentSave}
                />
            )}

            {/* 1. Header */}
            <div className="bg-white px-6 py-4 border-b border-gray-200 shadow-sm flex justify-between items-center h-16 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-md">
                        {patient.fullName.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 leading-tight">{patient.fullName}</h2>
                        <p className="text-xs text-gray-500 font-medium tracking-wide">
                            PID: {patient.patientId} • {patient.phone}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-gray-400">Balance Due</div>
                    {/* Calculate balance from all invoices if possible, or just show last */}
                    <div className="font-bold text-red-500">
                        ₹{invoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0).toFixed(2)}
                    </div>
                </div>
            </div>

            {/* 2. Content Area */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Left Col: Billing Form (8 cols) - Only for those who can CREATE invoices */}
                    {can("BILLING", "CREATE") && (
                        <div className="lg:col-span-5">
                            <FinancialBillingForm patient={patient} />
                        </div>
                    )}

                    {/* Right Col: History (7 cols) - Adjust span if form is hidden */}
                    <div className={can("BILLING", "CREATE") ? "lg:col-span-7 space-y-6" : "lg:col-span-12 space-y-6"}>
                        {/* Invoices List */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Invoice History</h3>

                            {successMessage && <div className="mb-4 text-green-600 bg-green-50 px-3 py-2 rounded-lg text-sm">{successMessage}</div>}
                            {error && <div className="mb-4 text-red-600 bg-red-50 px-3 py-2 rounded-lg text-sm">{error}</div>}

                            {loading && !invoices.length ? (
                                <p className="text-center py-4 text-gray-400">Loading...</p>
                            ) : invoices.length === 0 ? (
                                <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <p className="text-gray-400 text-sm">No invoices found for this patient.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50 text-gray-500 text-left">
                                                <th className="p-3 rounded-l-lg">Date</th>
                                                <th className="p-3">Treatment</th>
                                                <th className="p-3 text-right">Amount</th>
                                                <th className="p-3 text-center">Dr. Share</th>
                                                <th className="p-3 text-right">Status</th>
                                                <th className="p-3 rounded-r-lg">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {invoices.map(inv => (
                                                <tr key={inv._id} className="hover:bg-gray-50/50">
                                                    <td className="p-3 font-medium text-gray-700">
                                                        {new Date(inv.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-3 text-gray-600">
                                                        {inv.treatmentDetails?.treatmentName || "General"}
                                                    </td>
                                                    <td className="p-3 text-right font-bold text-gray-800">
                                                        ₹{inv.totalAmount?.toFixed(2)}
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        {inv.itemizedCharges?.doctorCharges > 0 ? (
                                                            <button
                                                                onClick={() => handleToggleDoctorPayment(inv._id)}
                                                                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${inv.isDoctorPaid
                                                                    ? "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200"
                                                                    : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
                                                                    }`}
                                                                title="Click to toggle Doctor Payout status"
                                                            >
                                                                {inv.isDoctorPaid ? "PAID OUT" : "PENDING"}
                                                            </button>
                                                        ) : (
                                                            <span className="text-gray-300 text-xs">-</span>
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${inv.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                                            inv.status === 'PARTIALLY_PAID' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-red-100 text-red-700'
                                                            }`}>
                                                            {inv.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        {(inv.status !== 'PAID' && can("BILLING", "CREATE")) && (
                                                            <button
                                                                onClick={() => setSelectedInvoiceForPayment(inv)}
                                                                className="px-3 py-1 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 text-xs font-medium transition-colors"
                                                            >
                                                                Pay
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillingWorkspace;
