import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Search, Download } from 'lucide-react';
import { portfolioService } from '../services/portfolio.service';
import RiskBadge from '../components/common/RiskBadge';

interface Position {
    id: string;
    symbol: string;
    quantity: number;
    entryPrice: number;
    currentPrice: number;
    pnl: number;
    pnlPercent: number;
    exposure: number;
    riskLevel: number;
    sector?: string;
}

const Portfolio: React.FC = () => {
    const [positions, setPositions] = useState<Position[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSector, setFilterSector] = useState('all');
    const [filterRisk, setFilterRisk] = useState('all');

    useEffect(() => {
        fetchPortfolio();
    }, []);

    const fetchPortfolio = async () => {
        try {
            const data = await portfolioService.getPortfolio();
            setPositions(data.positions || []);
        } catch (error) {
            console.error('Failed to fetch portfolio:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate summary stats
    const totalValue = positions.reduce((sum, p) => sum + p.exposure, 0);
    const totalPnL = positions.reduce((sum, p) => sum + p.pnl, 0);
    const avgRisk = positions.length > 0
        ? positions.reduce((sum, p) => sum + p.riskLevel, 0) / positions.length
        : 0;

    // Filter positions
    const filteredPositions = positions.filter((p) => {
        const matchesSearch = p.symbol.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSector = filterSector === 'all' || p.sector === filterSector;
        const matchesRisk =
            filterRisk === 'all' ||
            (filterRisk === 'low' && p.riskLevel < 0.4) ||
            (filterRisk === 'medium' && p.riskLevel >= 0.4 && p.riskLevel < 0.7) ||
            (filterRisk === 'high' && p.riskLevel >= 0.7);
        return matchesSearch && matchesSector && matchesRisk;
    });

    const sectors = Array.from(new Set(positions.map((p) => p.sector).filter(Boolean)));

    // Helper to convert numeric risk to badge level
    const getRiskLevel = (risk: number): 'low' | 'medium' | 'high' | 'critical' => {
        if (risk < 0.3) return 'low';
        if (risk < 0.6) return 'medium';
        if (risk < 0.8) return 'high';
        return 'critical';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-gray-500">Loading portfolio...</div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Portfolio</h1>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Download className="w-5 h-5" />
                    Export CSV
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <p className="text-sm text-gray-500 mb-1">Total Value</p>
                    <p className="text-2xl font-bold text-gray-900">₹{totalValue.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <p className="text-sm text-gray-500 mb-1">Total P&L</p>
                    <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toLocaleString()}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <p className="text-sm text-gray-500 mb-1">Avg Risk Score</p>
                    <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-gray-900">{(avgRisk * 100).toFixed(1)}%</p>
                        <RiskBadge level={getRiskLevel(avgRisk)} score={avgRisk} showScore={false} />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search symbols..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <select
                        value={filterSector}
                        onChange={(e) => setFilterSector(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Sectors</option>
                        {sectors.map((sector) => (
                            <option key={sector} value={sector}>
                                {sector}
                            </option>
                        ))}
                    </select>
                    <select
                        value={filterRisk}
                        onChange={(e) => setFilterRisk(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Risk Levels</option>
                        <option value="low">Low Risk</option>
                        <option value="medium">Medium Risk</option>
                        <option value="high">High Risk</option>
                    </select>
                </div>
            </div>

            {/* Positions Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Symbol
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Quantity
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Entry Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Current Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    P&L
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Risk Level
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredPositions.map((position) => (
                                <tr key={position.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-semibold text-gray-900">{position.symbol}</div>
                                        {position.sector && (
                                            <div className="text-sm text-gray-500">{position.sector}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {position.quantity}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        ₹{position.entryPrice.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        ₹{position.currentPrice.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-1">
                                            {position.pnl >= 0 ? (
                                                <TrendingUp className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <TrendingDown className="w-4 h-4 text-red-600" />
                                            )}
                                            <span
                                                className={`text-sm font-semibold ${position.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                                                    }`}
                                            >
                                                {position.pnl >= 0 ? '+' : ''}₹{position.pnl.toFixed(2)} (
                                                {position.pnlPercent.toFixed(2)}%)
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <RiskBadge level={getRiskLevel(position.riskLevel)} score={position.riskLevel} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Portfolio;
