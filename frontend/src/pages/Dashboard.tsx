import { useEffect, useState } from 'react';
import { AnalyticsPanel } from '../components/dashboard/AnalyticsPanel';
import { ChatPanel } from '../components/dashboard/ChatPanel';
import { TradesPanel } from '../components/dashboard/TradesPanel';
import { dashboardService } from '../services/dashboard.service';

export const Dashboard = () => {
    const [selectedTrade, setSelectedTrade] = useState<any | null>(null);
    const [trades, setTrades] = useState<any[]>([]);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrades = async () => {
            try {
                const data = await dashboardService.getTrades();
                setTrades(data.current);
                setSuggestions(data.suggested);
            } catch (error) {
                console.error("Failed to fetch trades", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTrades();
    }, []);

    useEffect(() => {
        if (selectedTrade) {
            const fetchChart = async () => {
                try {
                    const data = await dashboardService.getChartData(selectedTrade.symbol);
                    setChartData(data.data);
                } catch (error) {
                    console.error("Failed to fetch chart data", error);
                }
            };
            fetchChart();
        }
    }, [selectedTrade]);

    const handleSelectTrade = (trade: any) => {
        setSelectedTrade(trade);
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50">Loading Dashboard...</div>;

    return (
        <div className="h-[calc(100vh-64px)] bg-gray-50 p-6 overflow-hidden">
            <div className="h-full max-w-[1920px] mx-auto grid grid-cols-12 gap-6">
                {/* Left Section - Trades Panel (25%) */}
                <div className="col-span-3 h-full min-w-[300px]">
                    <TradesPanel
                        trades={trades}
                        suggestions={suggestions}
                        onSelectTrade={handleSelectTrade}
                        selectedTradeId={selectedTrade?.id || null}
                    />
                </div>

                {/* Center Section - Analytics (50%) */}
                <div className="col-span-6 h-full min-w-[500px]">
                    <AnalyticsPanel trade={selectedTrade} chartData={chartData} />
                </div>

                {/* Right Section - AI Chatbot (25%) */}
                <div className="col-span-3 h-full min-w-[300px]">
                    <ChatPanel tradeId={selectedTrade?.id || null} />
                </div>
            </div>
        </div>
    );
};
