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
    const { invoices, payments, loading, actionLoading, successMessage, error } = useSelector(state => state.billing);
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

                    {/* Billing Form - Centered */}
                    {can("BILLING", "CREATE") && (
                        <div className="lg:col-span-8 lg:col-start-3 space-y-6">
                            {/* 1. New Invoice Form */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <FinancialBillingForm patient={patient} />
                            </div>

                            {/* 2. Pending Invoices & Payments */}
                            {invoices.filter(inv => inv.status !== 'PAID').length > 0 && (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <span>🕒</span> Pending Invoices
                                    </h3>
                                    <div className="space-y-6">
                                        {invoices.filter(inv => inv.status !== 'PAID').map(invoice => {
                                            // Get payments for this invoice
                                            const invoicePayments = (payments || []).filter(p =>
                                                (typeof p.invoiceId === 'string' ? p.invoiceId : p.invoiceId?._id) === invoice._id
                                            );

                                            return (
                                                <div key={invoice._id} className="border border-gray-200 rounded-xl overflow-hidden">
                                                    {/* Invoice Header */}
                                                    <div className="bg-gray-50 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-gray-800">{invoice.invoiceNumber}</span>
                                                                <span className="text-xs text-gray-500">• {new Date(invoice.createdAt).toLocaleDateString()}</span>
                                                            </div>
                                                            <div className="text-sm text-gray-600 mt-1">
                                                                {invoice.treatmentDetails?.treatmentName || "General Treatment"}
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-sm text-gray-500">Balance Due</div>
                                                            <div className="text-xl font-bold text-red-600">
                                                                ₹{(invoice.totalAmount - invoice.paidAmount).toFixed(2)}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Payment History & Actions */}
                                                    <div className="p-4 bg-white">
                                                        {/* Progress Bar */}
                                                        <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                                                            <div
                                                                className="bg-teal-500 h-2 rounded-full transition-all duration-500"
                                                                style={{ width: `${Math.min((invoice.paidAmount / invoice.totalAmount) * 100, 100)}%` }}
                                                            ></div>
                                                        </div>

                                                        <div className="flex justify-between items-center mb-4">
                                                            <div className="text-sm text-gray-600">
                                                                <span className="font-medium text-gray-900">Total: ₹{invoice.totalAmount}</span>
                                                                <span className="mx-2 text-gray-300">|</span>
                                                                <span className="text-green-600">Paid: ₹{invoice.paidAmount}</span>
                                                            </div>
                                                            <button
                                                                onClick={() => setSelectedInvoiceForPayment(invoice)}
                                                                className="px-4 py-2 bg-teal-600 text-white text-sm font-bold rounded-lg hover:bg-teal-700 shadow-sm transition-colors"
                                                            >
                                                                Pay Now
                                                            </button>
                                                        </div>

                                                        {/* Previous Payments List */}
                                                        {invoicePayments.length > 0 && (
                                                            <div className="mt-4 border-t border-gray-100 pt-3">
                                                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Payment History</h4>
                                                                <div className="space-y-2">
                                                                    {invoicePayments.map(payment => (
                                                                        <div key={payment._id} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded-lg">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-lg">{
                                                                                    payment.mode === 'CASH' ? '💵' :
                                                                                        payment.mode === 'CARD' ? '💳' :
                                                                                            payment.mode === 'UPI' ? '📱' : '🏦'
                                                                                }</span>
                                                                                <span className="font-medium text-gray-700">{payment.mode}</span>
                                                                                {payment.reference && (
                                                                                    <span className="text-xs text-gray-400">({payment.reference})</span>
                                                                                )}
                                                                            </div>
                                                                            <div className="font-bold text-gray-800">
                                                                                ₹{payment.amount.toFixed(2)}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BillingWorkspace;
