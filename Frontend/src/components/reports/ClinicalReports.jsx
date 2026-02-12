import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProcedureStats } from "../../redux/reportSlice";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";
import { Stethoscope, Calendar } from "lucide-react";

const ClinicalReports = () => {
    const dispatch = useDispatch();
    const { procedureStats } = useSelector(state => state.reports);

    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        dispatch(fetchProcedureStats(dateRange));
    }, [dispatch, dateRange]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-900 text-white p-3 rounded-xl shadow-xl text-xs">
                    <p className="font-bold mb-2 text-teal-300">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="flex justify-between gap-4 mb-0.5" style={{ color: entry.fill }}>
                            <span>{entry.name}:</span>
                            <span className="font-mono font-bold">
                                {entry.name === 'Revenue' ? `₹${entry.value}` : entry.value}
                            </span>
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-gray-100 pb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
                                <Stethoscope className="w-5 h-5" />
                            </div>
                            Procedure Statistics
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 ml-11">Analyze procedure frequency and revenue</p>
                    </div>

                    <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                        <div className="relative">
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                className="pl-3 pr-2 py-1.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-xs font-medium"
                            />
                        </div>
                        <span className="text-gray-400 font-medium text-xs">to</span>
                        <div className="relative">
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                className="pl-3 pr-2 py-1.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-xs font-medium"
                            />
                        </div>
                    </div>
                </div>

                {procedureStats.loading ? (
                    <div className="h-96 flex items-center justify-center text-gray-400">
                        <div className="animate-pulse">Loading analytics...</div>
                    </div>
                ) : procedureStats.data?.length > 0 ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* Chart */}
                        <div className="h-[400px] bg-gray-50 rounded-2xl p-4 border border-gray-100">
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Performance Overview</h4>
                            <ResponsiveContainer width="100%" height="90%">
                                <BarChart
                                    data={procedureStats.data}
                                    layout="vertical"
                                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                                    barGap={4}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        type="category"
                                        dataKey="procedure"
                                        width={120}
                                        tick={{ fontSize: 11, fill: '#4b5563', fontWeight: 600 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
                                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                    <Bar dataKey="count" name="Count" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={12} />
                                    <Bar dataKey="revenue" name="Revenue" fill="#14b8a6" radius={[0, 4, 4, 0]} barSize={12} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Table */}
                        <div className="flex flex-col">
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">Detailed Breakdown</h4>
                            <div className="flex-1 overflow-hidden bg-white border border-gray-100 rounded-xl shadow-sm">
                                <div className="overflow-y-auto max-h-[360px] custom-scrollbar">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs font-bold text-gray-500 uppercase bg-gray-50 sticky top-0 border-b border-gray-100">
                                            <tr>
                                                <th className="px-5 py-3">Procedure</th>
                                                <th className="px-5 py-3 text-right">Count</th>
                                                <th className="px-5 py-3 text-right">Revenue</th>
                                                <th className="px-5 py-3 text-right">Avg. Cost</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {procedureStats.data.map((item, idx) => (
                                                <tr key={item.procedure} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-5 py-3 font-semibold text-gray-700">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-6 h-6 rounded-md bg-teal-50 text-teal-600 flex items-center justify-center text-xs font-bold">
                                                                {idx + 1}
                                                            </span>
                                                            {item.procedure}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3 text-right font-medium text-gray-600">{item.count}</td>
                                                    <td className="px-5 py-3 text-right font-bold text-teal-600">₹{item.revenue.toLocaleString()}</td>
                                                    <td className="px-5 py-3 text-right text-gray-400 text-xs">
                                                        ₹{Math.round(item.revenue / (item.count || 1)).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gray-50 font-bold border-t border-gray-200 sticky bottom-0">
                                            <tr>
                                                <td className="px-5 py-3 text-gray-800">Total</td>
                                                <td className="px-5 py-3 text-right text-gray-800">
                                                    {procedureStats.data.reduce((sum, i) => sum + i.count, 0)}
                                                </td>
                                                <td className="px-5 py-3 text-right text-teal-700">
                                                    ₹{procedureStats.data.reduce((sum, i) => sum + i.revenue, 0).toLocaleString()}
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <Stethoscope className="w-8 h-8 text-gray-300" />
                        </div>
                        <h4 className="text-gray-900 font-bold">No data found</h4>
                        <p className="text-gray-500 text-sm mt-1">Try selecting a different date range</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClinicalReports;
