import Payment from "../models/Payment.js";
import Invoice from "../models/Invoice.js";

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

export const getPayments = async (req, res) => {
    try {
        const { invoiceId, patientId } = req.query;

        if (!invoiceId && !patientId) {
            return res.status(400).json({
                success: false,
                message: "Either invoiceId or patientId is required"
            });
        }

        let query = {};

        if (invoiceId) {
            query.invoiceId = invoiceId;
        } else if (patientId) {
            // Find all invoices for this patient first
            const invoices = await Invoice.find({ patientId }).select("_id");
            const invoiceIds = invoices.map(inv => inv._id);
            query.invoiceId = { $in: invoiceIds };
        }

        const payments = await Payment.find(query)
            .populate("receivedBy", "fullName")
            .populate("invoiceId", "invoiceNumber") // Populate invoice number for reference
            .sort({ receivedAt: -1 });

        // If fetching by invoiceId, include invoice summary (backward compatibility/specific use case)
        let invoice = null;
        if (invoiceId) {
            invoice = await Invoice.findById(invoiceId).select("invoiceNumber totalAmount paidAmount status");
        }

        res.json({
            success: true,
            data: {
                payments,
                invoice // Will be null if fetching by patientId
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
    getPayments
};
