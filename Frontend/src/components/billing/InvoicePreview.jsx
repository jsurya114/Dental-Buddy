import { useRef } from "react";
import { usePermissions } from "../../hooks/usePermission";
import { Printer, ArrowLeft, CreditCard } from "lucide-react";

const STATUS_CONFIG = {
    UNPAID: { label: "Unpaid", color: "bg-red-50 text-red-700 border-red-100 ring-red-500/20" },
    PARTIALLY_PAID: { label: "Partial", color: "bg-amber-50 text-amber-700 border-amber-100 ring-amber-500/20" },
    PAID: { label: "Paid", color: "bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-500/20" }
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
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                        body { font-family: 'Inter', sans-serif; padding: 40px; color: #1f2937; }
                        * { box-sizing: border-box; }
                        .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #f3f4f6; padding-bottom: 30px; }
                        .brand { font-size: 24px; font-weight: 800; color: #0d9488; letter-spacing: -0.5px; }
                        .invoice-title { font-size: 32px; font-weight: 800; color: #111827; margin: 0; line-height: 1; }
                        .meta-group { margin-top: 10px; text-align: right; }
                        .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin-bottom: 4px; font-weight: 600; }
                        .value { font-size: 14px; color: #374151; font-weight: 500; }
                        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
                        .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #9ca3af; margin-bottom: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
                        .info-block p { margin: 4px 0; font-size: 14px; }
                        .info-name { font-weight: 700; font-size: 16px; color: #111827; }
                        
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th { text-align: left; padding: 12px 10px; background-color: #f9fafb; font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: 600; border-radius: 4px; }
                        td { padding: 16px 10px; border-bottom: 1px solid #f3f4f6; font-size: 14px; color: #374151; }
                        .amount-col { text-align: right; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
                        
                        .totals { margin-top: 30px; margin-left: auto; width: 300px; }
                        .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #4b5563; }
                        .total-row.final { font-size: 18px; font-weight: 800; color: #111827; border-top: 2px solid #e5e7eb; padding-top: 15px; margin-top: 5px; }
                        .total-row.balance { color: #dc2626; font-weight: 700; }
                        
                        .footer { margin-top: 80px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #f3f4f6; padding-top: 20px; }
                        
                        @media print {
                            body { -webkit-print-color-adjust: exact; padding: 0; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div>
                            <div class="brand">Dental Buddy</div>
                            <div style="font-size: 12px; color: #6b7280; margin-top: 5px;">Excellence in Dental Care</div>
                        </div>
                        <div class="meta-group">
                            <h1 class="invoice-title">INVOICE</h1>
                            <div style="margin-top: 10px;">#${invoice.invoiceNumber}</div>
                            <div style="font-size: 12px; color: #6b7280;">${new Date(invoice.createdAt).toLocaleDateString()}</div>
                        </div>
                    </div>

                    <div class="grid">
                        <div class="info-block">
                            <div class="section-title">Billed To</div>
                            <div class="info-name">${invoice.patientName || "Patient"}</div>
                            <p>ID: ${invoice.patientId && typeof invoice.patientId === 'object' ? invoice.patientId.patientId : (invoice.patientId || '-')}</p>
                        </div>
                        <div class="info-block" style="text-align: right;">
                            <div class="section-title">Payment Status</div>
                            <div class="info-name" style="color: ${invoice.status === 'PAID' ? '#059669' : invoice.status === 'UNPAID' ? '#dc2626' : '#d97706'}">
                                ${invoice.status}
                            </div>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Description / Treatment</th>
                                <th class="amount-col">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${invoice.items && invoice.items.length > 0 ? invoice.items.map(item => `
                                <tr>
                                    <td>
                                        <div style="font-weight: 500;">${item.name || item.treatmentType}</div>
                                        ${item.notes ? `<div style="font-size: 12px; color: #9ca3af; margin-top: 2px;">${item.notes}</div>` : ''}
                                    </td>
                                    <td class="amount-col">₹${item.cost?.toFixed(2)}</td>
                                </tr>
                            `).join('') : `
                                <tr>
                                    <td>${invoice.treatmentType || "Dental Services"}</td>
                                    <td class="amount-col">₹${invoice.totalAmount?.toFixed(2)}</td>
                                </tr>
                            `}
                        </tbody>
                    </table>

                    <div class="totals">
                        <div class="total-row">
                            <span>Subtotal</span>
                            <span>₹${invoice.totalAmount?.toFixed(2)}</span>
                        </div>
                        <div class="total-row">
                            <span>Tax (0%)</span>
                            <span>₹0.00</span>
                        </div>
                        <div class="total-row final">
                            <span>Total</span>
                            <span>₹${invoice.totalAmount?.toFixed(2)}</span>
                        </div>
                        <div class="total-row" style="color: #059669; font-weight: 500;">
                            <span>Paid</span>
                            <span>₹${invoice.paidAmount?.toFixed(2)}</span>
                        </div>
                        <div class="total-row balance">
                            <span>Balance Due</span>
                            <span>₹${(invoice.totalAmount - invoice.paidAmount).toFixed(2)}</span>
                        </div>
                    </div>

                    <div class="footer">
                        <p>Thank you for choosing Dental Buddy!</p>
                        <p>For any queries, please contact support@dentalbuddy.com</p>
                    </div>
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
            <div className="bg-gray-50/80 backdrop-blur-sm px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-white hover:shadow-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                </button>
                <div className="flex gap-3">
                    <button
                        onClick={handlePrint}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm flex items-center gap-2"
                    >
                        <Printer className="w-4 h-4" />
                        Print
                    </button>
                    {invoice.status !== "PAID" && can("PAYMENT", "CREATE") && (
                        <button
                            onClick={() => onPay(invoice)}
                            className="px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition-all shadow-md shadow-teal-500/20 flex items-center gap-2"
                        >
                            <CreditCard className="w-4 h-4" />
                            Pay Now
                        </button>
                    )}
                </div>
            </div>

            {/* Printable Content Preview */}
            <div id="printable-invoice" className="p-10 max-w-3xl mx-auto bg-white min-h-[600px]">
                {/* Header */}
                <div className="flex justify-between items-start mb-10 border-b-2 border-gray-100 pb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">INVOICE</h1>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ring-1 ${statusConfig.color}`}>
                                {statusConfig.label}
                            </span>
                        </div>
                        <div className="text-gray-500 font-mono text-sm">#{invoice.invoiceNumber}</div>
                    </div>
                    <div className="text-right text-sm text-gray-600 space-y-1">
                        <div><span className="font-semibold text-gray-400 uppercase text-xs">Issued:</span> {new Date(invoice.createdAt).toLocaleDateString()}</div>
                        <div><span className="font-semibold text-gray-400 uppercase text-xs">Due:</span> Upon Receipt</div>
                    </div>
                </div>

                {/* Patient Info */}
                <div className="mb-10 grid grid-cols-2">
                    <div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To</div>
                        <div className="text-xl font-bold text-gray-900">{invoice.patientName || "Patient"}</div>
                        {invoice.patientId && (
                            <div className="text-sm text-gray-500 mt-1">
                                ID: {typeof invoice.patientId === 'object' ? invoice.patientId.patientId : invoice.patientId}
                            </div>
                        )}
                    </div>
                </div>

                {/* Line Items */}
                <div className="mb-10">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 text-xs font-bold text-gray-400 uppercase tracking-wider pl-4 bg-gray-50 rounded-l-lg">Description</th>
                                <th className="text-right py-3 text-xs font-bold text-gray-400 uppercase tracking-wider pr-4 bg-gray-50 rounded-r-lg">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {invoice.items && invoice.items.length > 0 ? (
                                invoice.items.map((item, index) => (
                                    <tr key={index}>
                                        <td className="py-4 pl-4 text-sm text-gray-800">
                                            <div className="font-medium">{item.name || item.treatmentType}</div>
                                            {item.notes && <div className="text-xs text-gray-500 mt-1">{item.notes}</div>}
                                        </td>
                                        <td className="py-4 pr-4 text-right text-sm font-medium text-gray-800 font-mono">
                                            ₹{item.cost?.toFixed(2)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td className="py-4 pl-4 text-sm text-gray-800">
                                        {invoice.treatmentType || "Dental Services"}
                                    </td>
                                    <td className="py-4 pr-4 text-right text-sm font-medium text-gray-800 font-mono">
                                        ₹{invoice.totalAmount?.toFixed(2)}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="flex flex-col items-end space-y-3 pt-6">
                    <div className="w-72 flex justify-between text-sm text-gray-600">
                        <span>Subtotal</span>
                        <span>₹{invoice.totalAmount?.toFixed(2)}</span>
                    </div>

                    <div className="w-72 flex justify-between text-lg font-bold text-gray-900 border-t-2 border-gray-100 pt-4 mt-2">
                        <span>Total</span>
                        <span>₹{invoice.totalAmount?.toFixed(2)}</span>
                    </div>

                    <div className="w-72 flex justify-between text-sm text-emerald-600 font-medium pt-1">
                        <span>Paid</span>
                        <span>₹{invoice.paidAmount?.toFixed(2)}</span>
                    </div>

                    <div className="w-72 flex justify-between text-md font-bold text-red-500 pt-2 border-t border-gray-50">
                        <span>Balance Due</span>
                        <span>₹{balance.toFixed(2)}</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-16 pt-8 border-t border-gray-100 text-center text-xs text-gray-400">
                    <p>Thank you for choosing Dental Buddy!</p>
                </div>
            </div>
        </div>
    );
};

export default InvoicePreview;
