import { Activity, BarChart2, Maximize2, ShieldCheck, Target, Zap } from 'lucide-react';
import React from 'react';
import {
    CartesianGrid,
    ComposedChart,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import type { Trade } from '../../types/dashboard.types';

interface AnalyticsPanelProps {
    trade: Trade | null;
    chartData: any[];
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ trade, chartData }) => {
    if (!trade) {
        return (
            <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-100 p-8 items-center justify-center text-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                    <BarChart2 size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Whale Portfolio Overview</h2>
                <p className="text-gray-500 max-w-md">
                    Select a trade from the left panel to view detailed analytics, real-time metrics, and AI-driven risk insights.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full space-y-4">
            {/* Top Stats Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            {trade.symbol}
                            <span className="text-lg font-normal text-gray-400">/ INR</span>
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">{trade.name}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">₹{trade.currentPrice.toFixed(2)}</div>
                        <div className={`text-sm font-medium ${trade.pl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {trade.pl > 0 ? '+' : ''}{trade.pl}% Today
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-1">
                            <Target size={14} /> Entry Price
                        </div>
                        <div className="font-semibold text-gray-900">₹{trade.entryPrice.toFixed(2)}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-1">
                            <Activity size={14} /> Volatility
                        </div>
                        <div className="font-semibold text-gray-900">Low</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-1">
                            <Zap size={14} /> Momentum
                        </div>
                        <div className="font-semibold text-green-600">Bullish</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-1">
                            <ShieldCheck size={14} /> Confidence
                        </div>
                        <div className="font-semibold text-blue-600">92%</div>
                    </div>
                </div>
            </div>

            {/* Chart Section */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col p-4">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex gap-2">
                        {['1H', '1D', '1W', '1M', '1Y'].map((range) => (
                            <button
                                key={range}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${range === '1D'
                                    ? 'bg-gray-900 text-white'
                                    : 'text-gray-500 hover:bg-gray-100'
                                    }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                        <Maximize2 size={18} />
                    </button>
                </div>

                <div className="flex-1 w-full min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData && chartData.length > 0 ? chartData : []}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#9CA3AF' }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#9CA3AF' }}
                                domain={['auto', 'auto']}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#FFF', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ color: '#1F2937' }}
                            />
                            {/* Candlestick simulation using Bar for body and Line for wicks (simplified) */}
                            {/* Note: Recharts doesn't have native Candlestick. For a real app, use lightweight-charts or a custom shape. 
                  Here we mock it with a range bar or just a line for trend. 
                  Let's use a Line for now to represent the "price" trend cleanly. */}
                            <Line
                                type="monotone"
                                dataKey="close"
                                stroke="#2563EB"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 6, fill: '#2563EB', stroke: '#FFF', strokeWidth: 2 }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
