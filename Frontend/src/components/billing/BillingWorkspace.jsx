import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import FinancialBillingForm from "./FinancialBillingForm";
import { fetchInvoices, fetchPayments, addPayment, toggleDoctorPayment, clearSuccessMessage, clearError } from "../../redux/billingSlice";
import { usePermissions } from "../../hooks/usePermission";
import { CreditCard, Banknote, Landmark, CheckCheck, Loader2, X, FileText, Smartphone, DollarSign } from "lucide-react";

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

    const MODES = [
        { id: "CASH", label: "Cash", icon: Banknote },
        { id: "CARD", label: "Card", icon: CreditCard },
        { id: "UPI", label: "UPI", icon: Smartphone },
        { id: "BANK_TRANSFER", label: "Bank", icon: Landmark },
        { id: "CHEQUE", label: "Cheque", icon: FileText },
    ];

    return (
        <div className="fixed inset-0 bg-sky-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] w-full max-w-md p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200 border border-sky-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-sky-950">Record Payment</h3>
                    <button onClick={onClose} className="p-2 hover:bg-sky-50 rounded-full text-sky-400 hover:text-sky-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="mb-6 bg-sky-50/50 rounded-2xl p-5 border border-sky-100">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-sky-600 font-medium">Invoice #{invoice.invoiceNumber}</span>
                        <span className="font-bold text-sky-900">Total: ₹{invoice.totalAmount}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg">
                        <span className="font-bold text-sky-800">Balance Due</span>
                        <span className="font-bold text-rose-500">₹{(invoice.totalAmount - invoice.paidAmount).toFixed(2)}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-sky-900 mb-2">Amount to Pay</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-400 font-bold">₹</span>
                            <input
                                type="number"
                                required
                                min="1"
                                max={invoice.totalAmount - invoice.paidAmount}
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className="w-full pl-8 pr-4 py-3 bg-sky-50/30 border border-sky-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all font-bold text-sky-900"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-sky-900 mb-3">Payment Method</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {MODES.map((m) => {
                                const Icon = m.icon;
                                const isSelected = mode === m.id;
                                return (
                                    <button
                                        key={m.id}
                                        type="button"
                                        onClick={() => setMode(m.id)}
                                        className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border transition-all ${isSelected
                                            ? "bg-sky-100 border-sky-500 text-sky-700 ring-1 ring-sky-500 shadow-sm"
                                            : "bg-white border-sky-100 text-sky-500 hover:border-sky-300 hover:bg-sky-50"
                                            }`}
                                    >
                                        <Icon className={`w-5 h-5 ${isSelected ? "text-sky-600" : "text-sky-300"}`} />
                                        <span className="text-xs font-bold">{m.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {mode !== "CASH" && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                            <label className="block text-sm font-bold text-sky-900 mb-2">Reference / Transaction ID</label>
                            <input
                                type="text"
                                value={reference}
                                onChange={e => setReference(e.target.value)}
                                className="w-full px-4 py-3 bg-sky-50/30 border border-sky-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all placeholder:text-sky-300/50 font-medium text-sky-900"
                                placeholder="e.g. UPI-1234567890"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-sky-900 mb-2">Notes (Optional)</label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            className="w-full px-4 py-3 bg-sky-50/30 border border-sky-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all resize-none placeholder:text-sky-300/50 font-medium text-sky-900"
                            rows="2"
                            placeholder="Add any remarks..."
                        ></textarea>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 border border-sky-200 bg-white text-sky-700 rounded-xl font-bold hover:bg-sky-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 bg-sky-600 text-white rounded-xl font-bold shadow-lg shadow-sky-600/20 hover:bg-sky-700 transition-all active:scale-95"
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
        <div className="h-full flex flex-col bg-sky-50/30 relative">
            {selectedInvoiceForPayment && (
                <PaymentModal
                    invoice={selectedInvoiceForPayment}
                    onClose={() => setSelectedInvoiceForPayment(null)}
                    onSave={handlePaymentSave}
                />
            )}

            {/* 2. Content Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-sky-200 scrollbar-track-transparent">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Billing Form */}
                    {can("BILLING", "CREATE") && (
                        <div className="lg:col-span-8 lg:col-start-3 space-y-6">
                            {/* 1. New Invoice Form */}
                            <div className="bg-white rounded-[2rem] shadow-xl shadow-sky-900/5 border border-sky-100 p-1 overflow-hidden">
                                <FinancialBillingForm
                                    patient={patient}
                                    totalDue={invoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0)}
                                />
                            </div>

                            {/* 2. Pending Invoices & Payments */}
                            {invoices.filter(inv => inv.status !== 'PAID').length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-sky-900 flex items-center gap-2 px-1">
                                        <div className="p-1.5 bg-sky-100 text-sky-600 rounded-lg">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        Pending Invoices
                                    </h3>
                                    <div className="space-y-4">
                                        {invoices.filter(inv => inv.status !== 'PAID').map(invoice => {
                                            // Get payments for this invoice
                                            const invoicePayments = (payments || []).filter(p =>
                                                (typeof p.invoiceId === 'string' ? p.invoiceId : p.invoiceId?._id) === invoice._id
                                            );

                                            return (
                                                <div key={invoice._id} className="bg-white border border-sky-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                                    {/* Invoice Header */}
                                                    <div className="bg-sky-50/50 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-sky-100">
                                                        <div>
                                                            <div className="flex items-center gap-3">
                                                                <span className="font-bold text-sky-900 text-lg">{invoice.invoiceNumber}</span>
                                                                <span className="px-2.5 py-0.5 bg-white text-sky-500 text-xs font-bold border border-sky-100 rounded-full shadow-sm">
                                                                    {new Date(invoice.createdAt).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <div className="text-sm font-bold text-sky-600 mt-1 flex items-center gap-2 flex-wrap">
                                                                <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0"></span>
                                                                <span className="truncate">{invoice.treatmentDetails?.treatmentName || "General Treatment"}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end">
                                                            <div className="text-xs font-bold text-sky-400 uppercase tracking-wide">Balance Due</div>
                                                            <div className="text-xl font-bold text-rose-500">
                                                                ₹{(invoice.totalAmount - invoice.paidAmount).toFixed(2)}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Payment History & Actions */}
                                                    <div className="p-6">
                                                        {/* Progress Bar */}
                                                        <div className="w-full bg-sky-50 rounded-full h-3 mb-6 overflow-hidden border border-sky-100">
                                                            <div
                                                                className="bg-gradient-to-r from-sky-400 to-blue-500 h-full rounded-full transition-all duration-500 relative"
                                                                style={{ width: `${Math.min((invoice.paidAmount / invoice.totalAmount) * 100, 100)}%` }}
                                                            >
                                                                <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                                                            </div>
                                                        </div>

                                                        <div className="flex justify-between items-center mb-2">
                                                            <div className="text-sm">
                                                                <span className="text-sky-500 mr-2 font-medium">Total Amount:</span>
                                                                <span className="font-bold text-sky-900 text-base">₹{invoice.totalAmount}</span>
                                                            </div>
                                                            <div className="text-sm">
                                                                <span className="text-sky-500 mr-2 font-medium">Paid:</span>
                                                                <span className="font-bold text-emerald-600 text-base">₹{invoice.paidAmount}</span>
                                                            </div>
                                                        </div>

                                                        {/* Separator */}
                                                        <div className="h-px bg-sky-100 my-4"></div>

                                                        {/* Previous Payments List */}
                                                        {invoicePayments.length > 0 && (
                                                            <div className="mb-5">
                                                                <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-3">Recent Payments</h4>
                                                                <div className="space-y-2">
                                                                    {invoicePayments.map(payment => (
                                                                        <div key={payment._id} className="flex justify-between items-center text-sm bg-sky-50/50 p-3 rounded-xl border border-sky-100">
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-lg border border-sky-100 shadow-sm">
                                                                                    {payment.mode === 'CASH' ? '💵' :
                                                                                        payment.mode === 'CARD' ? '💳' :
                                                                                            payment.mode === 'UPI' ? '📱' : '🏦'}
                                                                                </div>
                                                                                <div>
                                                                                    <div className="font-bold text-sky-700">{payment.mode}</div>
                                                                                    {payment.reference && (
                                                                                        <div className="text-xs text-sky-400 font-mono">{payment.reference}</div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            <div className="font-bold text-sky-900">
                                                                                ₹{payment.amount.toFixed(2)}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="flex justify-end">
                                                            <button
                                                                onClick={() => setSelectedInvoiceForPayment(invoice)}
                                                                className="px-6 py-2.5 bg-sky-600 text-white text-sm font-bold rounded-xl hover:bg-sky-700 shadow-lg shadow-sky-600/20 transition-all active:scale-[0.98] flex items-center gap-2"
                                                            >
                                                                <CreditCard className="w-4 h-4" />
                                                                Pay Now
                                                            </button>
                                                        </div>
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
