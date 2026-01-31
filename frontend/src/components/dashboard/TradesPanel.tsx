import { ArrowDownRight, ArrowUpRight, MoreHorizontal, TrendingUp } from 'lucide-react';
import type { SuggestedTrade, Trade } from '../../types/dashboard.types';

export const TradesPanel = ({
    trades,
    suggestions,
    onSelectTrade,
    selectedTradeId
}: {
    trades: Trade[],
    suggestions: SuggestedTrade[],
    onSelectTrade: (trade: Trade) => void,
    selectedTradeId: string | null
}) => {
    return (
        <div className="flex flex-col h-full space-y-4">
            {/* Current Trades Section */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="font-semibold text-gray-800">Current Trades</h2>
                    <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-2 space-y-2">
                    <div className="grid grid-cols-12 text-xs font-medium text-gray-400 px-3 pb-2 uppercase tracking-wide">
                        <div className="col-span-4">Asset</div>
                        <div className="col-span-3 text-right">Price</div>
                        <div className="col-span-3 text-right">Risk</div>
                        <div className="col-span-2 text-right">P/L</div>
                    </div>

                    {trades.map((trade) => (
                        <div
                            key={trade.id}
                            onClick={() => onSelectTrade(trade)}
                            className={`grid grid-cols-12 items-center p-3 rounded-lg cursor-pointer transition-all duration-200 border ${selectedTradeId === trade.id
                                ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                                : 'border-transparent hover:bg-gray-50'
                                }`}
                        >
                            <div className="col-span-4">
                                <div className="font-semibold text-gray-900">{trade.symbol}</div>
                                <div className="text-xs text-gray-500 truncate">{trade.name}</div>
                            </div>

                            <div className="col-span-3 text-right">
                                <div className="font-medium text-gray-900">${trade.currentPrice.toFixed(2)}</div>
                                <div className={`text-xs flex items-center justify-end gap-0.5 ${trade.type === 'Long' ? 'text-green-600' : 'text-red-500'}`}>
                                    {trade.type === 'Long' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                    {trade.type}
                                </div>
                            </div>

                            <div className="col-span-3 text-right flex justify-end items-center gap-1">
                                <div className={`w-2 h-2 rounded-full ${trade.riskScore < 3 ? 'bg-green-500' : trade.riskScore < 5 ? 'bg-amber-400' : 'bg-red-500'
                                    }`} />
                                <span className="text-sm font-medium text-gray-700">{trade.riskScore}%</span>
                            </div>

                            <div className="col-span-2 text-right">
                                <span className={`text-sm font-semibold ${trade.pl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {trade.pl > 0 ? '+' : ''}{trade.pl}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Suggested Trades Section */}
            <div className="h-1/3 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                        <TrendingUp size={18} className="text-blue-600" />
                        AI Suggestions
                    </h2>
                </div>

                <div className="overflow-y-auto p-2 space-y-2">
                    {suggestions.map((suggestion) => (
                        <div key={suggestion.id} className="p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors cursor-pointer group">
                            <div className="flex justify-between items-start mb-1">
                                <div className="font-semibold text-gray-900">{suggestion.symbol}</div>
                                <div className={`text-xs px-2 py-0.5 rounded-full font-medium ${suggestion.riskLevel === 'Low' ? 'bg-green-100 text-green-700' :
                                    suggestion.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                    {suggestion.riskLevel} Risk
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">{suggestion.reason}</span>
                                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                    {suggestion.confidence}% Conf.
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
