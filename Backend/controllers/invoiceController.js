import Invoice from "../models/Invoice.js";
import Payment from "../models/Payment.js";
import Procedure from "../models/Procedure.js";
import CaseSheet from "../models/CaseSheet.js";

export const getEligibleProcedures = async (req, res) => {
    try {
        const { patientId } = req.query;

        if (!patientId) {
            return res.status(400).json({
                success: false,
                message: "patientId is required"
            });
        }

        const procedures = await Procedure.find({
            patientId,
            status: "COMPLETED",
            isBillable: true,
            invoiceId: null
        })
            .populate("performedBy", "fullName")
            .populate("caseSheetId", "_id")
            .sort({ performedAt: -1 });

        res.json({
            success: true,
            data: procedures,
            count: procedures.length
        });
    } catch (error) {
        console.error("Get eligible procedures error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch eligible procedures"
        });
    }
};

export const createInvoice = async (req, res) => {
    try {
        const {
            patientId,
            caseSheetId,
            procedureIds, // Optional now
            procedureAmounts, // Optional
            // Manual/Standalone fields
            treatmentName,
            treatmentCharges = 0,
            doctorCharges = 0,
            labCharges = 0,
            otherCharges = 0,
            discount = 0,
            discountType = "FIXED",
            tax = 0,
            notes = ""
        } = req.body;

        if (!patientId) {
            return res.status(400).json({
                success: false,
                message: "patientId is required"
            });
        }

        let procedureItems = [];
        let subtotal = 0;

        // PATH A: Case Sheet / Procedure based (Legacy/Contextual)
        if (procedureIds && procedureIds.length > 0) {
            const procedures = await Procedure.find({
                _id: { $in: procedureIds },
                patientId,
                status: "COMPLETED",
                isBillable: true,
                invoiceId: null
            });

            if (procedures.length !== procedureIds.length) {
                return res.status(400).json({
                    success: false,
                    message: "Some procedures are invalid or already invoiced"
                });
            }

            procedureItems = procedures.map(proc => ({
                procedureId: proc._id,
                name: proc.name,
                toothNumber: proc.toothNumber || "",
                amount: procedureAmounts?.[proc._id.toString()] || 0
            }));

            subtotal = procedureItems.reduce((sum, item) => sum + item.amount, 0);
        }

        // PATH B: Standalone / Manual Billing
        else {
            // Calculate subtotal from manual charges
            // Note: Usually "Treatment Charges" is the revenue. 
            // Doc/Lab/Other are expenses (costs), NOT additions to the patient's bill usually?
            // User said: "Auto calculate: Total Expenses, Total Profit".
            // AND "Treatment Charges".
            // Implication: Patient pays "Treatment Charges". 
            // Expenses are internal.
            // BUT "Total Amount" of invoice is what patient pays.
            // So Subtotal = Treatment Charges.

            subtotal = Number(treatmentCharges) || 0;
        }

        let discountAmount = discount;
        if (discountType === "PERCENTAGE") {
            discountAmount = (subtotal * discount) / 100;
        }

        const taxAmount = (subtotal - discountAmount) * (tax / 100);
        const totalAmount = subtotal - discountAmount + taxAmount;

        const invoiceData = {
            patientId,
            caseSheetId: caseSheetId || null, // Optional
            procedures: procedureItems,

            // New Fields
            treatmentDetails: {
                treatmentName: treatmentName || "General Treatment",
                description: notes
            },
            itemizedCharges: {
                treatmentCharges: Number(treatmentCharges) || 0,
                doctorCharges: Number(doctorCharges) || 0,
                labCharges: Number(labCharges) || 0,
                otherCharges: Number(otherCharges) || 0
            },

            subtotal,
            discount: discountAmount,
            discountType,
            tax: taxAmount,
            totalAmount,
            notes,
            createdBy: req.user.userId
        };

        const invoice = new Invoice(invoiceData);
        await invoice.save();

        // Mark procedures as invoiced if any
        if (procedureIds && procedureIds.length > 0) {
            await Procedure.updateMany(
                { _id: { $in: procedureIds } },
                { $set: { invoiceId: invoice._id } }
            );
        }

        await invoice.populate("patientId", "patientId fullName");
        await invoice.populate("createdBy", "fullName");

        res.status(201).json({
            success: true,
            message: "Invoice created successfully",
            data: invoice
        });
    } catch (error) {
        console.error("Create invoice error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create invoice"
        });
    }
};

export const getInvoices = async (req, res) => {
    try {
        const { patientId, status } = req.query;

        if (!patientId) {
            return res.status(400).json({
                success: false,
                message: "patientId is required"
            });
        }

        const query = { patientId };
        if (status) query.status = status;

        const invoices = await Invoice.find(query)
            .populate("patientId", "patientId fullName")
            .populate("createdBy", "fullName")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: invoices
        });
    } catch (error) {
        console.error("Get invoices error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch invoices"
        });
    }
};

export const getInvoiceById = async (req, res) => {
    try {
        const { id } = req.params;

        const invoice = await Invoice.findById(id)
            .populate("patientId", "patientId fullName phone")
            .populate("caseSheetId")
            .populate("procedures.procedureId")
            .populate("createdBy", "fullName");

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found"
            });
        }

        // Get payments for this invoice
        const payments = await Payment.find({ invoiceId: id })
            .populate("receivedBy", "fullName")
            .sort({ receivedAt: -1 });

        res.json({
            success: true,
            data: {
                ...invoice.toObject(),
                payments
            }
        });
    } catch (error) {
        console.error("Get invoice by ID error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch invoice"
        });
    }
};


export const toggleDoctorPaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const invoice = await Invoice.findById(id);
        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found"
            });
        }

        invoice.isDoctorPaid = !invoice.isDoctorPaid;
        await invoice.save();

        res.json({
            success: true,
            message: `Doctor payment status updated to ${invoice.isDoctorPaid ? "PAID" : "UNPAID"}`,
            data: {
                _id: invoice._id,
                isDoctorPaid: invoice.isDoctorPaid
            }
        });
    } catch (error) {
        console.error("Toggle doctor payment error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update doctor payment status"
        });
    }
};

export default {
    getEligibleProcedures,
    createInvoice,
    getInvoices,
    getInvoiceById,
    toggleDoctorPaymentStatus
};
