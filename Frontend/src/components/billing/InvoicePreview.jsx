import { useRef } from "react";
import { usePermissions } from "../../hooks/usePermission";

const STATUS_CONFIG = {
    UNPAID: { label: "Unpaid", color: "bg-red-100 text-red-700 border-red-200" },
    PARTIALLY_PAID: { label: "Partial", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    PAID: { label: "Paid", color: "bg-green-100 text-green-700 border-green-200" }
};

const InvoicePreview = ({ invoice, onBack, onPay }) => {
    const { can } = usePermissions();
    const printRef = useRef();

    const handlePrint = () => {
        const printContent = document.getElementById("printable-invoice");
        const windowUrl = "about:blank";
        const uniqueName = new Date().getTime();
        const windowName = "Print" + uniqueName;
        const printWindow = window.open(windowUrl, windowName, "left=50000,top=50000,width=0,height=0");

        printWindow.document.write(`
            <html>
                <head>
                    <title>Invoice #${invoice.invoiceNumber}</title>
                    <style>
                        body { font-family: sans-serif; padding: 20px; }
                        .header { display: flex; justify-content: space-between; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
                        .title { font-size: 24px; font-weight: bold; color: #333; }
                        .meta { text-align: right; color: #666; font-size: 14px; }
                        .section { margin-bottom: 20px; }
                        .label { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
                        .value { font-size: 16px; color: #000; font-weight: 500; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th { text-align: left; padding: 10px; border-bottom: 2px solid #eee; font-size: 12px; text-transform: uppercase; color: #888; }
                        td { padding: 10px; border-bottom: 1px solid #eee; font-size: 14px; color: #333; }
                        .total-section { margin-top: 20px; text-align: right; }
                        .total-row { display: flex; justify-content: flex-end; padding: 5px 0; }
                        .total-label { width: 100px; color: #666; }
                        .total-value { width: 100px; text-align: right; font-weight: bold; }
                        .grand-total { font-size: 18px; margin-top: 10px; border-top: 2px solid #333; padding-top: 10px; }
                        @media print {
                            body { -webkit-print-color-adjust: exact; }
                        }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    const statusConfig = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.UNPAID;
    const balance = invoice.totalAmount - invoice.paidAmount;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Action Bar */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                    <span>←</span> Create New Invoice
                </button>
                <div className="flex gap-3">
                    <button
                        onClick={handlePrint}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
                    >
                        <span>🖨️</span> Print
                    </button>
                    {invoice.status !== "PAID" && can("PAYMENT", "CREATE") && (
                        <button
                            onClick={() => onPay(invoice)}
                            className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors shadow-sm flex items-center gap-2"
                        >
                            <span>💳</span> Pay Now
                        </button>
                    )}
                </div>
            </div>

            {/* Printable Content */}
            <div id="printable-invoice" className="p-8 max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-gray-900">INVOICE</h1>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${statusConfig.color}`}>
                                {statusConfig.label}
                            </span>
                        </div>
                        <div className="text-gray-500 font-mono">#{invoice.invoiceNumber}</div>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                        <div className="mb-1">Issued: {new Date(invoice.createdAt).toLocaleDateString()}</div>
                        <div>Due: Upon Receipt</div>
                    </div>
                </div>

                {/* Patient Info */}
                <div className="mb-8">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To</div>
                    <div className="text-lg font-bold text-gray-800">{invoice.patientName || "Patient"}</div>
                    {invoice.patientId && (
                        <div className="text-sm text-gray-500 mt-1">
                            ID: {typeof invoice.patientId === 'object' ? invoice.patientId.patientId : invoice.patientId}
                        </div>
                    )}
                </div>

                {/* Line Items */}
                <table className="w-full mb-8">
                    <thead>
                        <tr className="border-b-2 border-gray-100">
                            <th className="text-left py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Description</th>
                            <th className="text-right py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {invoice.items && invoice.items.length > 0 ? (
                            invoice.items.map((item, index) => (
                                <tr key={index}>
                                    <td className="py-4 text-sm text-gray-800">
                                        <div className="font-medium">{item.name || item.treatmentType}</div>
                                        {item.notes && <div className="text-xs text-gray-500 mt-1">{item.notes}</div>}
                                    </td>
                                    <td className="py-4 text-right text-sm font-medium text-gray-800 font-mono">
                                        ₹{item.cost?.toFixed(2)}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            // Fallback for older invoice structure or manual type
                            <tr>
                                <td className="py-4 text-sm text-gray-800">
                                    {invoice.treatmentType || "Dental Services"}
                                </td>
                                <td className="py-4 text-right text-sm font-medium text-gray-800 font-mono">
                                    ₹{invoice.totalAmount?.toFixed(2)}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Totals */}
                <div className="flex flex-col items-end space-y-2 border-t border-gray-100 pt-6">
                    <div className="w-64 flex justify-between text-sm text-gray-600">
                        <span>Subtotal</span>
                        <span>₹{invoice.totalAmount?.toFixed(2)}</span>
                    </div>
                    {/* Add discount/tax display if available in model */}

                    <div className="w-64 flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-3 mt-1">
                        <span>Total</span>
                        <span>₹{invoice.totalAmount?.toFixed(2)}</span>
                    </div>

                    <div className="w-64 flex justify-between text-sm text-green-600 font-medium pt-2">
                        <span>Paid</span>
                        <span>₹{invoice.paidAmount?.toFixed(2)}</span>
                    </div>

                    <div className="w-64 flex justify-between text-md font-bold text-red-500 pt-2">
                        <span>Balance Due</span>
                        <span>₹{balance.toFixed(2)}</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 pt-8 border-t border-gray-100 text-center text-xs text-gray-400">
                    <p>Thank you for choosing Dental Buddy!</p>
                </div>
            </div>
        </div>
    );
};

export default InvoicePreview;
