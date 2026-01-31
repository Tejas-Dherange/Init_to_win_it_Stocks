import React, { useEffect } from 'react';
import { Card } from '../components/common/Card';
import { RiskBadge } from '../components/common/RiskBadge';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { usePortfolioStore } from '../store/portfolioStore';
import { useDecisionStore } from '../store/decisionStore';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils/formatters';

export const Dashboard: React.FC = () => {
    const { summary, positions, loading: portfolioLoading, fetchPortfolio, error: portfolioError } = usePortfolioStore();
    const { decisions, loading: decisionsLoading, generateDecisions, error: decisionsError } = useDecisionStore();

    useEffect(() => {
        fetchPortfolio();
        generateDecisions();
    }, []);

    const highUrgencyDecisions = decisions.filter((d) => d.urgency >= 7);
    const error = portfolioError || decisionsError;

    return (
        <div className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error! </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Overview of your portfolio and trading decisions</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="card-hover">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total P&L</p>
                            <p className={`text-2xl font-bold mt-1 ${(summary?.totalPnL || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(summary?.totalPnL || 0)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {(summary?.totalPnL || 0) >= 0 ? '+' : ''}{formatPercent((summary?.totalPnL || 0) / (summary?.totalExposure || 1) * 100)}
                            </p>
                        </div>
                        {(summary?.totalPnL || 0) >= 0 ? (
                            <TrendingUp className="w-12 h-12 text-green-500 opacity-20" />
                        ) : (
                            <TrendingDown className="w-12 h-12 text-red-500 opacity-20" />
                        )}
                    </div>
                </Card>

                <Card className="card-hover">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Exposure</p>
                            <p className="text-2xl font-bold mt-1 text-gray-900">
                                {formatCurrency(summary?.totalExposure || 0)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{summary?.positionCount || 0} positions</p>
                        </div>
                        <TrendingUp className="w-12 h-12 text-primary-500 opacity-20" />
                    </div>
                </Card>

                <Card className="card-hover">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Avg Risk Score</p>
                            <p className="text-2xl font-bold mt-1 text-gray-900">
                                {((summary?.avgRiskScore || 0) * 100).toFixed(0)}%
                            </p>
                            <div className="mt-2">
                                {summary && (
                                    <RiskBadge
                                        level={
                                            summary.avgRiskScore < 0.4
                                                ? 'low'
                                                : summary.avgRiskScore < 0.6
                                                    ? 'medium'
                                                    : summary.avgRiskScore < 0.8
                                                        ? 'high'
                                                        : 'critical'
                                        }
                                        score={summary.avgRiskScore}
                                        showScore={false}
                                        size="sm"
                                    />
                                )}
                            </div>
                        </div>
                        <AlertTriangle className="w-12 h-12 text-yellow-500 opacity-20" />
                    </div>
                </Card>

                <Card className="card-hover">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">High Urgency</p>
                            <p className="text-2xl font-bold mt-1 text-red-600">
                                {highUrgencyDecisions.length}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Requires attention</p>
                        </div>
                        <Zap className="w-12 h-12 text-red-500 opacity-20" />
                    </div>
                </Card>
            </div>

            {/* High Urgency Decisions */}
            {highUrgencyDecisions.length > 0 && (
                <Card>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">⚠️ High Urgency Decisions</h2>
                        <Badge variant="danger">{highUrgencyDecisions.length} pending</Badge>
                    </div>
                    <div className="space-y-3">
                        {highUrgencyDecisions.map((decision) => (
                            <div
                                key={decision.symbol}
                                className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3">
                                        <span className="font-bold text-gray-900">{decision.symbol}</span>
                                        <Badge variant="danger">{decision.action}</Badge>
                                        <span className="text-sm text-gray-600">Urgency: {decision.urgency}/10</span>
                                    </div>
                                    <p className="text-sm text-gray-700 mt-1">{decision.rationale}</p>
                                </div>
                                <Button variant="danger" size="sm">
                                    Review
                                </Button>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Top Positions */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Top Positions</h2>
                    <Button variant="ghost" size="sm">
                        View All →
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-sm text-gray-600 border-b border-gray-200">
                                <th className="pb-3 font-medium">Symbol</th>
                                <th className="pb-3 font-medium">Quantity</th>
                                <th className="pb-3 font-medium">Price</th>
                                <th className="pb-3 font-medium">P&L</th>
                                <th className="pb-3 font-medium">Risk</th>
                                <th className="pb-3 font-medium">Exposure</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {positions.slice(0, 5).map((position) => (
                                <tr key={position.symbol} className="text-sm hover:bg-gray-50">
                                    <td className="py-3 font-semibold text-gray-900">{position.symbol}</td>
                                    <td className="py-3 text-gray-600">{position.quantity}</td>
                                    <td className="py-3 text-gray-900">
                                        {formatCurrency(position.currentPrice)}
                                    </td>
                                    <td className="py-3">
                                        <div className={position.pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                                            {formatCurrency(position.pnl)}
                                            <span className="ml-1 text-xs">
                                                ({position.pnl >= 0 ? '+' : ''}{formatPercent(position.pnlPercent)})
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-3">
                                        <RiskBadge
                                            level={
                                                position.riskScore < 0.4
                                                    ? 'low'
                                                    : position.riskScore < 0.6
                                                        ? 'medium'
                                                        : position.riskScore < 0.8
                                                            ? 'high'
                                                            : 'critical'
                                            }
                                            score={position.riskScore}
                                            size="sm"
                                        />
                                    </td>
                                    <td className="py-3 text-gray-900 font-medium">
                                        {formatCurrency(position.exposure)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Loading States */}
            {(portfolioLoading || decisionsLoading) && (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
