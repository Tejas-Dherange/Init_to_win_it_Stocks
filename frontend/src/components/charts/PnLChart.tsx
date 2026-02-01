import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PnLChartProps {
    data: Array<{
        timestamp: string;
        pnl: number;
    }>;
    symbol: string;
}

const PnLChart: React.FC<PnLChartProps> = ({ data, symbol }) => {

    const isProfit = data[data.length - 1]?.pnl >= 0;

    return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                P&L Over Time - {symbol}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop
                                offset="5%"
                                stopColor={isProfit ? '#10b981' : '#ef4444'}
                                stopOpacity={0.8}
                            />
                            <stop
                                offset="95%"
                                stopColor={isProfit ? '#10b981' : '#ef4444'}
                                stopOpacity={0.1}
                            />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="timestamp"
                        stroke="#6b7280"
                        tick={{ fontSize: 12 }}
                    />
                    <YAxis
                        stroke="#6b7280"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `₹${value.toLocaleString()}`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                        }}
                        formatter={(value: number) => [`₹${value.toFixed(2)}`, 'P&L']}
                    />
                    <Area
                        type="monotone"
                        dataKey="pnl"
                        stroke={isProfit ? '#10b981' : '#ef4444'}
                        strokeWidth={2}
                        fill="url(#pnlGradient)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PnLChart;
