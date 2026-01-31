export default function AuthLoading() {
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="text-center">
                <div className="mb-4">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">RiskMind</h2>
                <p className="text-gray-400">Loading your trading assistant...</p>
            </div>
        </div>
    );
}
