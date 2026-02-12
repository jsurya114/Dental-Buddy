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
import { IndianRupee, TrendingUp, Calendar, AlertCircle } from "lucide-react";

const COLORS = ["#0d9488", "#14b8a6", "#f59e0b", "#f97316", "#6366f1"];

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

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-900 text-white p-3 rounded-xl shadow-xl text-xs">
                    <p className="font-bold mb-1">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }}>
                            {entry.name}: ₹{Number(entry.value).toFixed(2)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Daily Collection Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <div className="p-2 bg-green-50 rounded-lg text-green-600">
                            <IndianRupee className="w-5 h-5" />
                        </div>
                        Daily Collection
                    </h3>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="date"
                            value={dailyDate}
                            onChange={(e) => setDailyDate(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-sm font-medium text-gray-700 hover:border-teal-300 transition-colors"
                        />
                    </div>
                </div>

                {dailyCollection.loading ? (
                    <div className="h-64 flex items-center justify-center text-gray-400">Loading...</div>
                ) : dailyCollection.data ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div className="relative">
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total</span>
                                <span className="text-3xl font-bold text-gray-800">
                                    ₹{dailyCollection.data.total?.toLocaleString('en-IN')}
                                </span>
                            </div>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={dailyPieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                            cornerRadius={5}
                                        >
                                            {dailyPieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-6">
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Breakdown by Mode</h4>
                            <div className="space-y-4">
                                {dailyPieData.map((item, idx) => (
                                    <div key={item.name} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                                            <span className="font-semibold text-gray-700">{item.name}</span>
                                        </div>
                                        <span className="font-bold text-gray-900">₹{item.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-400">No data available</div>
                )}
            </div>

            {/* Monthly Revenue Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        Monthly Revenue
                    </h3>
                    <select
                        value={monthlyYear}
                        onChange={(e) => setMonthlyYear(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-sm font-bold text-gray-700 bg-white"
                    >
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                {monthlyRevenue.loading ? (
                    <div className="h-80 flex items-center justify-center text-gray-400">Loading...</div>
                ) : (
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyRevenue.data} barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="month"
                                    tickFormatter={(m) => new Date(0, m - 1).toLocaleString('default', { month: 'short' })}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    tickFormatter={(value) => `₹${value / 1000}k`}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F3F4F6' }} />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="revenue" name="Total Revenue" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={32} />
                                <Bar dataKey="collected" name="Collected" fill="#14b8a6" radius={[4, 4, 0, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Outstanding Dues Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <div className="p-2 bg-red-50 rounded-lg text-red-600">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        Outstanding Dues
                    </h3>
                    {outstandingDues.data && (
                        <div className="px-4 py-2 bg-red-50 border border-red-100 text-red-700 rounded-xl font-bold text-sm shadow-sm">
                            Total Due: ₹{outstandingDues.data.totalOutstanding?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                    )}
                </div>

                {outstandingDues.loading ? (
                    <div className="text-center py-8 text-gray-400">Loading...</div>
                ) : outstandingDues.data?.invoices?.length > 0 ? (
                    <div className="overflow-hidden bg-white border border-gray-100 rounded-xl shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs font-bold text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4">Date / Invoice</th>
                                    <th className="px-6 py-4">Patient Details</th>
                                    <th className="px-6 py-4 text-right">Total</th>
                                    <th className="px-6 py-4 text-right">Paid</th>
                                    <th className="px-6 py-4 text-right">Due</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {outstandingDues.data.invoices.map((inv) => (
                                    <tr key={inv._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-800">{new Date(inv.date).toLocaleDateString()}</div>
                                            <div className="text-xs text-teal-600 font-mono mt-0.5">{inv.invoiceNumber}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{inv.patientName}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">{inv.patientPhone}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-600">₹{inv.amount.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right font-medium text-emerald-600">₹{inv.paid.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right font-bold text-red-600">₹{inv.due.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${inv.status === "UNPAID"
                                                    ? "bg-red-100 text-red-700 border border-red-200"
                                                    : "bg-amber-100 text-amber-700 border border-amber-200"
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
                    <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <div className="text-4xl mb-3">✅</div>
                        <p>No outstanding dues found!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FinancialReports;
