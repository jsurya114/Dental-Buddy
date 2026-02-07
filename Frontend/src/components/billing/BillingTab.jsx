import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { usePermissions } from "../../hooks/usePermission";
import {
    fetchEligibleProcedures,
    fetchInvoices,
    createInvoice,
    addPayment,
    clearSuccessMessage,
    clearError
} from "../../redux/billingSlice";

const PAYMENT_MODES = [
    { value: "CASH", label: "💵 Cash" },
    { value: "CARD", label: "💳 Card" },
    { value: "UPI", label: "📱 UPI" },
    { value: "BANK_TRANSFER", label: "🏦 Bank Transfer" },
    { value: "CHEQUE", label: "📝 Cheque" }
];

const STATUS_CONFIG = {
    UNPAID: { color: "bg-red-100 text-red-700", label: "Unpaid" },
    PARTIALLY_PAID: { color: "bg-yellow-100 text-yellow-700", label: "Partial" },
    PAID: { color: "bg-green-100 text-green-700", label: "Paid" }
};

const BillingTab = ({ patientId, caseSheetId }) => {
    const dispatch = useDispatch();
    const { can } = usePermissions();
    const { eligibleProcedures, invoices, loading, actionLoading, error, successMessage } = useSelector(state => state.billing);

    const [selectedProcedures, setSelectedProcedures] = useState({});
    const [procedureAmounts, setProcedureAmounts] = useState({});
    const [discount, setDiscount] = useState(0);
    const [discountType, setDiscountType] = useState("FIXED");
    const [tax, setTax] = useState(0);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [paymentData, setPaymentData] = useState({ amount: "", mode: "CASH", reference: "", notes: "" });

    useEffect(() => {
        if (patientId) {
            dispatch(fetchEligibleProcedures(patientId));
            dispatch(fetchInvoices(patientId));
        }
    }, [dispatch, patientId]);

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => dispatch(clearSuccessMessage()), 4000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, dispatch]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => dispatch(clearError()), 5000);
            return () => clearTimeout(timer);
        }
    }, [error, dispatch]);

    // Calculate invoice preview
    const selectedItems = eligibleProcedures.filter(p => selectedProcedures[p._id]);
    const subtotal = selectedItems.reduce((sum, p) => sum + (procedureAmounts[p._id] || 0), 0);
    const discountAmount = discountType === "PERCENTAGE" ? (subtotal * discount / 100) : discount;
    const taxAmount = (subtotal - discountAmount) * (tax / 100);
    const totalAmount = subtotal - discountAmount + taxAmount;

    const handleSelectProcedure = (procedureId, checked) => {
        setSelectedProcedures(prev => ({ ...prev, [procedureId]: checked }));
        if (!checked) {
            setProcedureAmounts(prev => {
                const updated = { ...prev };
                delete updated[procedureId];
                return updated;
            });
        }
    };

    const handleAmountChange = (procedureId, amount) => {
        setProcedureAmounts(prev => ({ ...prev, [procedureId]: parseFloat(amount) || 0 }));
    };

    const handleCreateInvoice = async () => {
        const procedureIds = Object.keys(selectedProcedures).filter(id => selectedProcedures[id]);
        if (!procedureIds.length) return;

        await dispatch(createInvoice({
            patientId,
            caseSheetId,
            procedureIds,
            procedureAmounts,
            discount,
            discountType,
            tax
        }));

        // Reset form
        setSelectedProcedures({});
        setProcedureAmounts({});
        setDiscount(0);
        setTax(0);

        // Refresh data
        dispatch(fetchEligibleProcedures(patientId));
    };

    const handleAddPayment = async (e) => {
        e.preventDefault();
        if (!selectedInvoice || !paymentData.amount) return;

        await dispatch(addPayment({
            invoiceId: selectedInvoice._id,
            amount: parseFloat(paymentData.amount),
            mode: paymentData.mode,
            reference: paymentData.reference,
            notes: paymentData.notes
        }));

        setShowPaymentModal(false);
        setSelectedInvoice(null);
        setPaymentData({ amount: "", mode: "CASH", reference: "", notes: "" });
    };

    const openPaymentModal = (invoice) => {
        setSelectedInvoice(invoice);
        setPaymentData({
            amount: (invoice.totalAmount - invoice.paidAmount).toFixed(2),
            mode: "CASH",
            reference: "",
            notes: ""
        });
        setShowPaymentModal(true);
    };

    if (loading && !invoices.length) {
        return (
            <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Messages */}
            {successMessage && (
                <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl">✓ {successMessage}</div>
            )}
            {error && (
                <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl">✗ {error}</div>
            )}

            {/* Eligible Procedures Section */}
            {can("BILLING", "CREATE") && eligibleProcedures.length > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span>🧾</span> Generate Invoice
                    </h3>

                    {/* Procedure Selection */}
                    <div className="space-y-3 mb-6">
                        <p className="text-sm text-gray-600">Select completed procedures to bill:</p>
                        {eligibleProcedures.map(proc => (
                            <label key={proc._id} className="flex items-center gap-4 p-3 bg-white rounded-xl border border-gray-100 cursor-pointer hover:border-teal-200">
                                <input
                                    type="checkbox"
                                    checked={selectedProcedures[proc._id] || false}
                                    onChange={(e) => handleSelectProcedure(proc._id, e.target.checked)}
                                    className="w-5 h-5 text-teal-500 rounded"
                                />
                                <div className="flex-1">
                                    <span className="font-medium text-gray-800">{proc.name}</span>
                                    {proc.toothNumber && <span className="text-gray-500 ml-2">• Tooth {proc.toothNumber}</span>}
                                </div>
                                {selectedProcedures[proc._id] && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500">₹</span>
                                        <input
                                            type="number"
                                            value={procedureAmounts[proc._id] || ""}
                                            onChange={(e) => handleAmountChange(proc._id, e.target.value)}
                                            className="w-24 px-3 py-1.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-teal-500"
                                            placeholder="Amount"
                                            min="0"
                                        />
                                    </div>
                                )}
                            </label>
                        ))}
                    </div>

                    {/* Invoice Preview */}
                    {selectedItems.length > 0 && (
                        <div className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
                            <h4 className="font-semibold text-gray-700 mb-3">Invoice Preview</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal ({selectedItems.length} items)</span>
                                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-gray-600">Discount</span>
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={discountType}
                                            onChange={(e) => setDiscountType(e.target.value)}
                                            className="px-2 py-1 rounded border border-gray-200 text-xs"
                                        >
                                            <option value="FIXED">₹</option>
                                            <option value="PERCENTAGE">%</option>
                                        </select>
                                        <input
                                            type="number"
                                            value={discount}
                                            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                            className="w-20 px-2 py-1 rounded border border-gray-200"
                                            min="0"
                                        />
                                        <span className="text-red-500">-₹{discountAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-gray-600">Tax (%)</span>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={tax}
                                            onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                                            className="w-20 px-2 py-1 rounded border border-gray-200"
                                            min="0"
                                        />
                                        <span className="text-gray-500">+₹{taxAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-gray-200 text-base font-bold">
                                    <span>Total</span>
                                    <span className="text-teal-600">₹{totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                            <button
                                onClick={handleCreateInvoice}
                                disabled={actionLoading || totalAmount <= 0}
                                className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50"
                            >
                                {actionLoading ? "Creating..." : "Generate Invoice"}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* No eligible procedures message */}
            {eligibleProcedures.length === 0 && can("BILLING", "CREATE") && (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                    <p className="text-gray-500">No completed procedures awaiting billing.</p>
                </div>
            )}

            {/* Invoice List */}
            <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span>📋</span> Invoices
                    <span className="text-sm font-normal text-gray-500">({invoices.length})</span>
                </h3>

                {invoices.length > 0 ? (
                    <div className="overflow-x-auto bg-white rounded-xl border border-gray-200">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Invoice No</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Total</th>
                                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Paid</th>
                                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Balance</th>
                                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((invoice) => {
                                    const statusConfig = STATUS_CONFIG[invoice.status];
                                    const balance = invoice.totalAmount - invoice.paidAmount;

                                    return (
                                        <tr key={invoice._id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-4 px-4">
                                                <span className="font-medium text-gray-800">{invoice.invoiceNumber}</span>
                                            </td>
                                            <td className="py-4 px-4 text-gray-600 text-sm">
                                                {new Date(invoice.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-4 px-4 text-right font-medium">
                                                ₹{invoice.totalAmount?.toFixed(2)}
                                            </td>
                                            <td className="py-4 px-4 text-right text-green-600">
                                                ₹{invoice.paidAmount?.toFixed(2)}
                                            </td>
                                            <td className="py-4 px-4 text-right text-red-600">
                                                {balance > 0 ? `₹${balance.toFixed(2)}` : "—"}
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                                                    {statusConfig.label}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                {invoice.status !== "PAID" && can("PAYMENT", "CREATE") && (
                                                    <button
                                                        onClick={() => openPaymentModal(invoice)}
                                                        className="px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                                                    >
                                                        💵 Add Payment
                                                    </button>
                                                )}
                                                {invoice.status === "PAID" && (
                                                    <span className="text-xs text-gray-400">✓ Settled</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
                        <div className="text-4xl mb-3">📋</div>
                        <p>No invoices yet.</p>
                    </div>
                )}
            </div>

            {/* Payment Modal */}
            {showPaymentModal && selectedInvoice && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Add Payment</h3>
                        <p className="text-gray-500 text-sm mb-4">
                            Invoice: {selectedInvoice.invoiceNumber} •
                            Balance: ₹{(selectedInvoice.totalAmount - selectedInvoice.paidAmount).toFixed(2)}
                        </p>

                        <form onSubmit={handleAddPayment} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                                    <input
                                        type="number"
                                        value={paymentData.amount}
                                        onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500"
                                        required
                                        min="0.01"
                                        max={selectedInvoice.totalAmount - selectedInvoice.paidAmount}
                                        step="0.01"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode *</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {PAYMENT_MODES.map(mode => (
                                        <button
                                            key={mode.value}
                                            type="button"
                                            onClick={() => setPaymentData({ ...paymentData, mode: mode.value })}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${paymentData.mode === mode.value
                                                    ? "bg-teal-500 text-white border-teal-500"
                                                    : "bg-gray-50 text-gray-700 border-gray-200 hover:border-teal-300"
                                                }`}
                                        >
                                            {mode.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reference / Transaction ID</label>
                                <input
                                    type="text"
                                    value={paymentData.reference}
                                    onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500"
                                    placeholder="UPI ID, Card last 4, Cheque no..."
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setShowPaymentModal(false); setSelectedInvoice(null); }}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50"
                                >
                                    {actionLoading ? "Processing..." : "Record Payment"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BillingTab;
