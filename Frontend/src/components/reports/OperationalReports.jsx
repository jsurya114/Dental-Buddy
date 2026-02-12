import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNewPatients } from "../../redux/reportSlice";
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
import { TrendingUp, Users } from "lucide-react";

const OperationalReports = () => {
    const dispatch = useDispatch();
    const { newPatients } = useSelector(state => state.reports);

    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
        dispatch(fetchNewPatients(year));
    }, [dispatch, year]);

    // Calculate totals
    const totalMales = newPatients.data.reduce((sum, item) => sum + item.males, 0);
    const totalFemales = newPatients.data.reduce((sum, item) => sum + item.females, 0);
    const totalCount = newPatients.data.reduce((sum, item) => sum + item.count, 0);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-gray-900 text-white p-3 rounded-xl shadow-xl text-xs">
                    <p className="font-bold mb-2 text-indigo-300">
                        {new Date(0, data.month - 1).toLocaleString('default', { month: 'long' })}
                    </p>
                    <div className="space-y-1">
                        <p className="flex justify-between gap-4 text-blue-300">
                            <span>Male:</span>
                            <span className="font-bold">{data.males}</span>
                        </p>
                        <p className="flex justify-between gap-4 text-pink-300">
                            <span>Female:</span>
                            <span className="font-bold">{data.females}</span>
                        </p>
                        <div className="border-t border-gray-700 my-1 pt-1 flex justify-between gap-4 font-bold text-white">
                            <span>Total:</span>
                            <span>{data.count}</span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                <Users className="w-5 h-5" />
                            </div>
                            Patient Growth
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 ml-11">New patient registrations tracking</p>
                    </div>
                    <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-sm font-bold text-gray-700 bg-white"
                    >
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                {newPatients.loading ? (
                    <div className="h-96 flex items-center justify-center text-gray-400">Loading...</div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* Chart */}
                        <div className="h-[400px] bg-indigo-50/30 rounded-2xl p-4 border border-indigo-50">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={newPatients.data}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    barGap={0}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e7ff" />
                                    <XAxis
                                        dataKey="month"
                                        tickFormatter={(m) => new Date(0, m - 1).toLocaleString('default', { month: 'short' })}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6366f1', fontSize: 12, fontWeight: 500 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#eef2ff' }} />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Bar dataKey="males" name="Male" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} barSize={32} />
                                    <Bar dataKey="females" name="Female" stackId="a" fill="#ec4899" radius={[4, 4, 0, 0]} barSize={32} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Summary Table */}
                        <div className="flex flex-col">
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">Monthly Breakdown</h4>
                            <div className="flex-1 overflow-hidden bg-white border border-gray-100 rounded-xl shadow-sm">
                                <div className="overflow-y-auto max-h-[360px] custom-scrollbar">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs font-bold text-gray-500 uppercase bg-gray-50 sticky top-0 border-b border-gray-100">
                                            <tr>
                                                <th className="px-5 py-3">Month</th>
                                                <th className="px-5 py-3 text-right text-blue-600">Male</th>
                                                <th className="px-5 py-3 text-right text-pink-500">Female</th>
                                                <th className="px-5 py-3 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {newPatients.data.filter(d => d.count > 0).map((item) => (
                                                <tr key={item.month} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-5 py-3 font-medium text-gray-800">
                                                        {new Date(0, item.month - 1).toLocaleString('default', { month: 'long' })}
                                                    </td>
                                                    <td className="px-5 py-3 text-right font-medium text-gray-600">{item.males}</td>
                                                    <td className="px-5 py-3 text-right font-medium text-gray-600">{item.females}</td>
                                                    <td className="px-5 py-3 text-right font-bold text-indigo-600">{item.count}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gray-50 font-bold border-t border-gray-200 sticky bottom-0">
                                            <tr>
                                                <td className="px-5 py-3 text-gray-900">Total</td>
                                                <td className="px-5 py-3 text-right text-blue-600">{totalMales}</td>
                                                <td className="px-5 py-3 text-right text-pink-500">{totalFemales}</td>
                                                <td className="px-5 py-3 text-right text-indigo-700 text-base">{totalCount}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OperationalReports;
