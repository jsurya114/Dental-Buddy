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

    return (
        <div className="space-y-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <span>🩺</span> Procedure Statistics
                    </h3>
                    <div className="flex gap-2">
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
                        />
                        <span className="self-center text-gray-400">to</span>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
                        />
                    </div>
                </div>

                {procedureStats.loading ? (
                    <div className="h-96 flex items-center justify-center text-gray-400">Loading...</div>
                ) : procedureStats.data?.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Chart */}
                        <div className="h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={procedureStats.data}
                                    layout="vertical"
                                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                    <XAxis type="number" />
                                    <YAxis type="category" dataKey="procedure" width={100} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" name="Count" fill="#8884d8" radius={[0, 4, 4, 0]} barSize={20} />
                                    <Bar dataKey="revenue" name="Revenue" fill="#82ca9d" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Table */}
                        <div className="overflow-auto max-h-96">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3">Procedure</th>
                                        <th className="px-4 py-3 text-right">Count</th>
                                        <th className="px-4 py-3 text-right">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {procedureStats.data.map((item) => (
                                        <tr key={item.procedure} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium text-gray-800">{item.procedure}</td>
                                            <td className="px-4 py-3 text-right">{item.count}</td>
                                            <td className="px-4 py-3 text-right text-teal-600">₹{item.revenue.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-400">No procedures found for this period</div>
                )}
            </div>
        </div>
    );
};

export default ClinicalReports;
