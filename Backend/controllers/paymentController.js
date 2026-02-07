import Payment from "../models/Payment.js";
import Invoice from "../models/Invoice.js";

/**
 * Add payment to an invoice
 * POST /api/payments
 */
export const addPayment = async (req, res) => {
    try {
        const { invoiceId, amount, mode, reference, notes } = req.body;

        // Validate required fields
        if (!invoiceId || !amount || !mode) {
            return res.status(400).json({
                success: false,
                message: "invoiceId, amount, and mode are required"
            });
        }

        // Fetch invoice
        const invoice = await Invoice.findById(invoiceId);
        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found"
            });
        }

        // Check if already fully paid
        if (invoice.status === "PAID") {
            return res.status(400).json({
                success: false,
                message: "Invoice is already fully paid"
            });
        }

        // Calculate remaining balance
        const remainingBalance = invoice.totalAmount - invoice.paidAmount;

        // Prevent overpayment
        if (amount > remainingBalance) {
            return res.status(400).json({
                success: false,
                message: `Overpayment not allowed. Remaining balance: ₹${remainingBalance.toFixed(2)}`
            });
        }

        // Create payment
        const payment = new Payment({
            invoiceId,
            amount,
            mode,
            reference: reference || "",
            notes: notes || "",
            receivedBy: req.user.userId,
            receivedAt: new Date()
        });

        await payment.save();

        // Update invoice paid amount and status
        invoice.paidAmount += amount;
        invoice.updatePaymentStatus();
        await invoice.save();

        // Populate for response
        await payment.populate("receivedBy", "fullName");

        res.status(201).json({
            success: true,
            message: `Payment of ₹${amount} recorded successfully`,
            data: {
                payment,
                invoice: {
                    _id: invoice._id,
                    invoiceNumber: invoice.invoiceNumber,
                    totalAmount: invoice.totalAmount,
                    paidAmount: invoice.paidAmount,
                    balance: invoice.totalAmount - invoice.paidAmount,
                    status: invoice.status
                }
            }
        });
    } catch (error) {
        console.error("Add payment error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add payment"
        });
    }
};

/**
 * Get payments for an invoice
 * GET /api/payments?invoiceId=...
 */
export const getPaymentsByInvoice = async (req, res) => {
    try {
        const { invoiceId } = req.query;

        if (!invoiceId) {
            return res.status(400).json({
                success: false,
                message: "invoiceId is required"
            });
        }

        const payments = await Payment.find({ invoiceId })
            .populate("receivedBy", "fullName")
            .sort({ receivedAt: -1 });

        // Get invoice summary
        const invoice = await Invoice.findById(invoiceId).select("invoiceNumber totalAmount paidAmount status");

        res.json({
            success: true,
            data: {
                payments,
                invoice
            }
        });
    } catch (error) {
        console.error("Get payments error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch payments"
        });
    }
};

export default {
    addPayment,
    getPaymentsByInvoice
};
