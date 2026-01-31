import React from 'react';
import { Clock, TrendingUp, AlertTriangle } from 'lucide-react';

interface Decision {
    id: string;
    symbol: string;
    action: string;
    rationale: string;
    urgency: number;
    riskScore: number;
    status: string;
    createdAt: string;
}

interface DecisionCardProps {
    decision: Decision;
    onConfirm?: (id: string) => void;
    onReject?: (id: string) => void;
    onClick?: () => void;
}

const DecisionCard: React.FC<DecisionCardProps> = ({
    decision,
    onConfirm,
    onReject,
    onClick,
}) => {
    const getActionColor = (action: string) => {
        switch (action.toUpperCase()) {
            case 'EXIT':
            case 'STOP_LOSS':
                return 'bg-red-100 text-red-800 border-red-300';
            case 'REDUCE':
                return 'bg-orange-100 text-orange-800 border-orange-300';
            case 'REALLOCATE':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'HOLD':
                return 'bg-green-100 text-green-800 border-green-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'approved':
            case 'executed':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const isPending = decision.status.toLowerCase() === 'pending';

    return (
        <div
            className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
            onClick={onClick}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">{decision.symbol}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">
                            {new Date(decision.createdAt).toLocaleString()}
                        </span>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getActionColor(decision.action)}`}>
                        {decision.action}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(decision.status)}`}>
                        {decision.status}
                    </span>
                </div>
            </div>

            {/* Urgency and Risk */}
            <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-5 h-5 ${decision.urgency >= 7 ? 'text-red-500' : 'text-yellow-500'}`} />
                    <div>
                        <p className="text-xs text-gray-500">Urgency</p>
                        <p className="text-sm font-semibold text-gray-900">{decision.urgency}/10</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    <div>
                        <p className="text-xs text-gray-500">Risk Score</p>
                        <p className="text-sm font-semibold text-gray-900">
                            {(decision.riskScore * 100).toFixed(1)}%
                        </p>
                    </div>
                </div>
            </div>

            {/* Rationale */}
            <div className="mb-3">
                <p className="text-sm text-gray-700 line-clamp-2">{decision.rationale}</p>
            </div>

            {/* Action Buttons (only for pending) */}
            {isPending && onConfirm && onReject && (
                <div className="flex gap-2 mt-4 pt-3 border-t">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onReject(decision.id);
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Reject
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onConfirm(decision.id);
                        }}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                        Confirm
                    </button>
                </div>
            )}
        </div>
    );
};

export default DecisionCard;
