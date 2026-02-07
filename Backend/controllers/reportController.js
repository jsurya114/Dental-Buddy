import Payment from "../models/Payment.js";
import Invoice from "../models/Invoice.js";
import Procedure from "../models/Procedure.js";
import Patient from "../models/Patient.js";
import mongoose from "mongoose";

/**
 * Helper to get date range from query
 */
const getDateRange = (query) => {
    const { from, to } = query;
    const start = from ? new Date(from) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = to ? new Date(to) : new Date();

    // Set end to end of day
    end.setHours(23, 59, 59, 999);
    // Set start to start of day
    start.setHours(0, 0, 0, 0);

    return { start, end };
};

/**
 * Report: Daily Collection
 * GET /api/reports/finance/daily?date=YYYY-MM-DD
 */
export const getDailyCollection = async (req, res) => {
    try {
        const date = req.query.date ? new Date(req.query.date) : new Date();
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const aggregation = [
            {
                $match: {
                    receivedAt: { $gte: startOfDay, $lte: endOfDay }
                }
            },
            {
                $group: {
                    _id: "$mode",
                    totalAmount: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            }
        ];

        const results = await Payment.aggregate(aggregation);

        const total = results.reduce((sum, item) => sum + item.totalAmount, 0);
        const byMode = results.reduce((acc, item) => {
            acc[item._id] = item.totalAmount;
            return acc;
        }, {});

        res.json({
            success: true,
            data: {
                date: startOfDay.toISOString().split('T')[0],
                total,
                byMode,
                details: results
            }
        });
    } catch (error) {
        console.error("Daily collection report error:", error);
        res.status(500).json({ success: false, message: "Failed to generate report" });
    }
};

/**
 * Report: Monthly Revenue
 * GET /api/reports/finance/monthly?year=2026
 */
export const getMonthlyRevenue = async (req, res) => {
    try {
        const year = parseInt(req.query.year) || new Date().getFullYear();
        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year, 11, 31, 23, 59, 59);

        const aggregation = [
            {
                $match: {
                    createdAt: { $gte: startOfYear, $lte: endOfYear }
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    revenue: { $sum: "$totalAmount" },
                    collected: { $sum: "$paidAmount" },
                    invoiceCount: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ];

        const results = await Invoice.aggregate(aggregation);

        // Fill missing months
        const monthlyData = Array.from({ length: 12 }, (_, i) => {
            const data = results.find(r => r._id === i + 1);
            return {
                month: i + 1,
                revenue: data?.revenue || 0,
                collected: data?.collected || 0,
                invoiceCount: data?.invoiceCount || 0
            };
        });

        res.json({
            success: true,
            data: monthlyData
        });
    } catch (error) {
        console.error("Monthly revenue report error:", error);
        res.status(500).json({ success: false, message: "Failed to generate report" });
    }
};

/**
 * Report: Outstanding Dues
 * GET /api/reports/finance/outstanding
 */
export const getOutstandingDues = async (req, res) => {
    try {
        const invoices = await Invoice.find({
            status: { $in: ["UNPAID", "PARTIALLY_PAID"] }
        })
            .populate("patientId", "fullName phone patientId")
            .sort({ createdAt: -1 });

        const totalOutstanding = invoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0);

        res.json({
            success: true,
            data: {
                totalOutstanding,
                count: invoices.length,
                invoices: invoices.map(inv => ({
                    _id: inv._id,
                    invoiceNumber: inv.invoiceNumber,
                    date: inv.createdAt,
                    patientName: inv.patientId?.fullName || "Unknown",
                    patientPhone: inv.patientId?.phone,
                    amount: inv.totalAmount,
                    paid: inv.paidAmount,
                    due: inv.totalAmount - inv.paidAmount,
                    status: inv.status
                }))
            }
        });
    } catch (error) {
        console.error("Outstanding dues report error:", error);
        res.status(500).json({ success: false, message: "Failed to generate report" });
    }
};

/**
 * Report: Procedure Frequency (Clinical)
 * GET /api/reports/clinical/procedures?from=...&to=...
 */
export const getProcedureStats = async (req, res) => {
    try {
        const { start, end } = getDateRange(req.query);

        const aggregation = [
            {
                $match: {
                    status: "COMPLETED",
                    completedAt: { $gte: start, $lte: end }
                }
            },
            {
                $group: {
                    _id: "$name",
                    count: { $sum: 1 },
                    totalRevenue: { $sum: "$cost" }
                }
            },
            { $sort: { count: -1 } }
        ];

        const results = await Procedure.aggregate(aggregation);

        res.json({
            success: true,
            data: results.map(r => ({
                procedure: r._id,
                count: r.count,
                revenue: r.totalRevenue
            }))
        });
    } catch (error) {
        console.error("Procedure stats report error:", error);
        res.status(500).json({ success: false, message: "Failed to generate report" });
    }
};

/**
 * Report: Patient Growth (Operational)
 * GET /api/reports/operational/patients?year=2026
 */
export const getNewPatients = async (req, res) => {
    try {
        const year = parseInt(req.query.year) || new Date().getFullYear();
        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year, 11, 31, 23, 59, 59);

        const aggregation = [
            {
                $match: {
                    createdAt: { $gte: startOfYear, $lte: endOfYear }
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    count: { $sum: 1 },
                    males: {
                        $sum: { $cond: [{ $eq: ["$gender", "Male"] }, 1, 0] }
                    },
                    females: {
                        $sum: { $cond: [{ $eq: ["$gender", "Female"] }, 1, 0] }
                    }
                }
            },
            { $sort: { "_id": 1 } }
        ];

        const results = await Patient.aggregate(aggregation);

        // Fill missing months
        const monthlyData = Array.from({ length: 12 }, (_, i) => {
            const data = results.find(r => r._id === i + 1);
            return {
                month: i + 1,
                count: data?.count || 0,
                males: data?.males || 0,
                females: data?.females || 0
            };
        });

        res.json({
            success: true,
            data: monthlyData
        });
    } catch (error) {
        console.error("New patients report error:", error);
        res.status(500).json({ success: false, message: "Failed to generate report" });
    }
};

export default {
    getDailyCollection,
    getMonthlyRevenue,
    getOutstandingDues,
    getProcedureStats,
    getNewPatients
};
