import React, { useEffect, useState } from 'react';
import { Filter } from 'lucide-react';
import DecisionCard from '../components/decisions/DecisionCard';
import ConfirmationDialog from '../components/decisions/ConfirmationDialog';
import { useDecisionActions } from '../hooks/useDecisionActions';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface Decision {
    id: string;
    symbol: string;
    action: string;
    rationale: string;
    urgency: number;
    riskScore: number;
    status: string;
    createdAt: string;
    expectedPnl?: number;
}

const Decisions: React.FC = () => {
    const [decisions, setDecisions] = useState<Decision[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const { confirmDecision, rejectDecision, getPendingActions } = useDecisionActions();

    useEffect(() => {
        fetchDecisions();
    }, []);

    const fetchDecisions = async () => {
        try {
            // Fetch all decisions (you can add pagination later)
            const response = await axios.get(`${API_URL}/decisions/generate`);
            // For now, we'll use pending actions as a demo
            const pending = await getPendingActions();
            setDecisions(pending || []);
        } catch (error) {
            console.error('Failed to fetch decisions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (id: string) => {
        try {
            await confirmDecision(id);
            // Refresh decisions
            await fetchDecisions();
            setShowConfirmDialog(false);
        } catch (error) {
            console.error('Failed to confirm decision:', error);
        }
    };

    const handleReject = async (id: string) => {
        try {
            await rejectDecision(id);
            // Refresh decisions
            await fetchDecisions();
            setShowConfirmDialog(false);
        } catch (error) {
            console.error('Failed to reject decision:', error);
        }
    };

    const handleCardClick = (decision: Decision) => {
        setSelectedDecision(decision);
        if (decision.status === 'pending') {
            setShowConfirmDialog(true);
        }
    };

    const filteredDecisions = decisions.filter((d) => {
        if (filterStatus === 'all') return true;
        return d.status.toLowerCase() === filterStatus.toLowerCase();
    });

    const pendingCount = decisions.filter((d) => d.status === 'pending').length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-gray-500">Loading decisions...</div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Trading Decisions</h1>
                    <p className="text-gray-500 mt-1">
                        {pendingCount} pending decision{pendingCount !== 1 ? 's' : ''} awaiting confirmation
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-center gap-4">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="executed">Executed</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Pending Decisions */}
            {pendingCount > 0 && (
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Approval</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {decisions
                            .filter((d) => d.status === 'pending')
                            .map((decision) => (
                                <DecisionCard
                                    key={decision.id}
                                    decision={decision}
                                    onConfirm={handleConfirm}
                                    onReject={handleReject}
                                    onClick={() => handleCardClick(decision)}
                                />
                            ))}
                    </div>
                </div>
            )}

            {/* All Decisions */}
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Decision History</h2>
                {filteredDecisions.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                        <p className="text-gray-500">No decisions found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredDecisions.map((decision) => (
                            <DecisionCard
                                key={decision.id}
                                decision={decision}
                                onClick={() => handleCardClick(decision)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Confirmation Dialog */}
            {selectedDecision && (
                <ConfirmationDialog
                    decision={selectedDecision}
                    onConfirm={handleConfirm}
                    onReject={handleReject}
                    onClose={() => {
                        setShowConfirmDialog(false);
                        setSelectedDecision(null);
                    }}
                    isOpen={showConfirmDialog}
                />
            )}
        </div>
    );
};

export default Decisions;
