import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface RiskChartProps {
    data: Array<{
        timestamp: string;
        riskScore: number;
    }>;
    symbol: string;
}

const RiskChart: React.FC<RiskChartProps> = ({ data, symbol }) => {
    const getRiskColor = (score: number) => {
        if (score < 0.4) return '#10b981'; // green
        if (score < 0.7) return '#f59e0b'; // yellow
        return '#ef4444'; // red
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Risk Score Over Time - {symbol}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
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
                        domain={[0, 1]}
                        tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                        }}
                        formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Risk Score']}
                    />
                    <Area
                        type="monotone"
                        dataKey="riskScore"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="url(#riskGradient)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RiskChart;
