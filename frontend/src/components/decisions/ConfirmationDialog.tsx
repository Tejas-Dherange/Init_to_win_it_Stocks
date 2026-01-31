import React from 'react';
import { X } from 'lucide-react';

interface Decision {
    id: string;
    symbol: string;
    action: string;
    rationale: string;
    urgency: number;
    riskScore: number;
    expectedPnl?: number;
}

interface ConfirmationDialogProps {
    decision: Decision;
    onConfirm: (decisionId: string) => void;
    onReject: (decisionId: string, reason?: string) => void;
    onClose: () => void;
    isOpen: boolean;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    decision,
    onConfirm,
    onReject,
    onClose,
    isOpen,
}) => {
    if (!isOpen) return null;

    const getActionColor = (action: string) => {
        switch (action.toUpperCase()) {
            case 'EXIT':
            case 'STOP_LOSS':
                return 'text-red-600 bg-red-50';
            case 'REDUCE':
                return 'text-orange-600 bg-orange-50';
            case 'REALLOCATE':
                return 'text-yellow-600 bg-yellow-50';
            case 'HOLD':
                return 'text-green-600 bg-green-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const getUrgencyColor = (urgency: number) => {
        if (urgency >= 8) return 'bg-red-500';
        if (urgency >= 6) return 'bg-orange-500';
        if (urgency >= 4) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Confirm Trading Decision
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Symbol and Action */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Symbol</p>
                            <p className="text-2xl font-bold text-gray-900">{decision.symbol}</p>
                        </div>
                        <div className={`px-4 py-2 rounded-lg font-semibold ${getActionColor(decision.action)}`}>
                            {decision.action}
                        </div>
                    </div>

                    {/* Urgency */}
                    <div>
                        <p className="text-sm text-gray-500 mb-2">Urgency Level</p>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full ${getUrgencyColor(decision.urgency)}`}
                                    style={{ width: `${decision.urgency * 10}%` }}
                                />
                            </div>
                            <span className="text-sm font-semibold text-gray-700">
                                {decision.urgency}/10
                            </span>
                        </div>
                    </div>

                    {/* Risk Score */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-500">Risk Score</p>
                            <p className="text-xl font-bold text-gray-900">
                                {(decision.riskScore * 100).toFixed(1)}%
                            </p>
                        </div>
                        {decision.expectedPnl !== undefined && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-500">Expected P&L</p>
                                <p className={`text-xl font-bold ${decision.expectedPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ₹{decision.expectedPnl.toFixed(2)}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Rationale */}
                    <div>
                        <p className="text-sm text-gray-500 mb-2">AI Rationale</p>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-gray-700 leading-relaxed">{decision.rationale}</p>
                        </div>
                    </div>

                    {/* Warning */}
                    {decision.urgency >= 8 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-800 font-semibold">⚠️ High Urgency Action</p>
                            <p className="text-red-700 text-sm mt-1">
                                This decision requires immediate attention due to high risk or significant market movement.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
                    <button
                        onClick={() => onReject(decision.id)}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                    >
                        Reject
                    </button>
                    <button
                        onClick={() => onConfirm(decision.id)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        Confirm & Execute
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationDialog;
