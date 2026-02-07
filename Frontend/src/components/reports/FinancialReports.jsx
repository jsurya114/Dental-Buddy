import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchDailyCollection,
    fetchMonthlyRevenue,
    fetchOutstandingDues
} from "../../redux/reportSlice";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const FinancialReports = () => {
    const dispatch = useDispatch();
    const { dailyCollection, monthlyRevenue, outstandingDues } = useSelector(state => state.reports);

    const [dailyDate, setDailyDate] = useState(new Date().toISOString().split('T')[0]);
    const [monthlyYear, setMonthlyYear] = useState(new Date().getFullYear());

    useEffect(() => {
        dispatch(fetchDailyCollection(dailyDate));
    }, [dispatch, dailyDate]);

    useEffect(() => {
        dispatch(fetchMonthlyRevenue(monthlyYear));
    }, [dispatch, monthlyYear]);

    useEffect(() => {
        dispatch(fetchOutstandingDues());
    }, [dispatch]);

    // Prepare data for Daily Collection Pie Chart
    const dailyPieData = dailyCollection.data?.byMode
        ? Object.entries(dailyCollection.data.byMode).map(([name, value]) => ({ name, value }))
        : [];

    return (
        <div className="space-y-8">
            {/* Daily Collection Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <span>💰</span> Daily Collection
                    </h3>
                    <input
                        type="date"
                        value={dailyDate}
                        onChange={(e) => setDailyDate(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                </div>

                {dailyCollection.loading ? (
                    <div className="h-64 flex items-center justify-center text-gray-400">Loading...</div>
                ) : dailyCollection.data ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <div className="text-center mb-4">
                                <span className="text-gray-500 text-sm">Total Collection</span>
                                <div className="text-3xl font-bold text-teal-600">
                                    ₹{dailyCollection.data.total?.toFixed(2)}
                                </div>
                            </div>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={dailyPieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {dailyPieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => `₹${value}`} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="overflow-auto max-h-80">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3">Mode</th>
                                        <th className="px-4 py-3 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dailyPieData.map((item, idx) => (
                                        <tr key={item.name} className="border-b border-gray-100">
                                            <td className="px-4 py-3 font-medium text-gray-700">
                                                <span className="w-2 h-2 rounded-full inline-block mr-2" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                                                {item.name}
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-gray-900">
                                                ₹{item.value.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-400">No data available</div>
                )}
            </div>

            {/* Monthly Revenue Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <span>📅</span> Monthly Revenue
                    </h3>
                    <select
                        value={monthlyYear}
                        onChange={(e) => setMonthlyYear(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                    >
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                {monthlyRevenue.loading ? (
                    <div className="h-80 flex items-center justify-center text-gray-400">Loading...</div>
                ) : (
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyRevenue.data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" tickFormatter={(m) => new Date(0, m - 1).toLocaleString('default', { month: 'short' })} />
                                <YAxis />
                                <Tooltip formatter={(value) => `₹${value}`} />
                                <Legend />
                                <Bar dataKey="revenue" name="Total Revenue" fill="#0d9488" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="collected" name="Collected" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Outstanding Dues Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <span>⚠️</span> Outstanding Dues
                    {outstandingDues.data && (
                        <span className="ml-auto text-red-600 bg-red-50 px-3 py-1 rounded-lg text-base">
                            Total: ₹{outstandingDues.data.totalOutstanding?.toFixed(2)}
                        </span>
                    )}
                </h3>

                {outstandingDues.loading ? (
                    <div className="text-center py-8 text-gray-400">Loading...</div>
                ) : outstandingDues.data?.invoices?.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Invoice</th>
                                    <th className="px-4 py-3">Patient</th>
                                    <th className="px-4 py-3 text-right">Total</th>
                                    <th className="px-4 py-3 text-right">Paid</th>
                                    <th className="px-4 py-3 text-right">Due</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {outstandingDues.data.invoices.map((inv) => (
                                    <tr key={inv._id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="px-4 py-3">{new Date(inv.date).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 font-medium">{inv.invoiceNumber}</td>
                                        <td className="px-4 py-3">
                                            <div>{inv.patientName}</div>
                                            <div className="text-xs text-gray-500">{inv.patientPhone}</div>
                                        </td>
                                        <td className="px-4 py-3 text-right">₹{inv.amount.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-right text-green-600">₹{inv.paid.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-right text-red-600 font-bold">₹{inv.due.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${inv.status === "UNPAID" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                                                }`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
                        No outstanding dues found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default FinancialReports;
