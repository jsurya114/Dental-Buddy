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

    return (
        <div className="space-y-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <span>📈</span> Patient Growth
                    </h3>
                    <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                    >
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                {newPatients.loading ? (
                    <div className="h-96 flex items-center justify-center text-gray-400">Loading...</div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Chart */}
                        <div className="h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={newPatients.data}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="month" tickFormatter={(m) => new Date(0, m - 1).toLocaleString('default', { month: 'short' })} />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="males" name="Male" stackId="a" fill="#60a5fa" />
                                    <Bar dataKey="females" name="Female" stackId="a" fill="#f472b6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Summary Table */}
                        <div className="overflow-auto max-h-96">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3">Month</th>
                                        <th className="px-4 py-3 text-right text-blue-600">Male</th>
                                        <th className="px-4 py-3 text-right text-pink-500">Female</th>
                                        <th className="px-4 py-3 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {newPatients.data.filter(d => d.count > 0).map((item) => (
                                        <tr key={item.month} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium text-gray-800">
                                                {new Date(0, item.month - 1).toLocaleString('default', { month: 'long' })}
                                            </td>
                                            <td className="px-4 py-3 text-right">{item.males}</td>
                                            <td className="px-4 py-3 text-right">{item.females}</td>
                                            <td className="px-4 py-3 text-right font-bold">{item.count}</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-gray-50 font-bold border-t border-gray-200">
                                        <td className="px-4 py-3">Total</td>
                                        <td className="px-4 py-3 text-right text-blue-600">
                                            {totalMales}
                                        </td>
                                        <td className="px-4 py-3 text-right text-pink-500">
                                            {totalFemales}
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-900">
                                            {totalCount}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OperationalReports;
