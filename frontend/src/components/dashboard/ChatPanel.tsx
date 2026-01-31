import { Bot, Info, Send, Sparkles } from 'lucide-react';
import React, { useState } from 'react';

interface ChatPanelProps {
    tradeId: string | null;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ tradeId }) => {
    const [input, setInput] = useState('');

    // Mock chat history based on context
    const messages = tradeId ? [
        { id: 1, role: 'ai', text: 'Analyzing spread and volume for this position...' },
        { id: 2, role: 'ai', text: 'This trade is showing strong bullish momentum, but watch out for resistance at $192. Risk remains moderate.' }
    ] : [
        { id: 1, role: 'ai', text: 'Hello! I am your AI Risk Analyst. Select a trade to get specific insights, or ask me about your overall portfolio health.' }
    ];

    return (
        <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Bot size={18} className="text-blue-600" />
                    Risk Analyst
                </h2>
                <button className="text-gray-400 hover:text-gray-600">
                    <Info size={18} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : 'bg-gray-100 text-gray-800 rounded-tl-none'
                            }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}

                {tradeId && (
                    <div className="flex justify-start">
                        <div className="max-w-[85%] rounded-2xl p-3 text-sm bg-blue-50 border border-blue-100 text-blue-800 rounded-tl-none flex gap-2 items-start">
                            <Sparkles size={14} className="mt-0.5 shrink-0" />
                            <div>
                                <p className="font-medium mb-1">Suggested Actions:</p>
                                <div className="space-y-1">
                                    <button className="block text-xs bg-white/80 hover:bg-white px-2 py-1 rounded border border-blue-200 text-blue-700 transition-colors w-full text-left">
                                        Why is risk score 2.5?
                                    </button>
                                    <button className="block text-xs bg-white/80 hover:bg-white px-2 py-1 rounded border border-blue-200 text-blue-700 transition-colors w-full text-left">
                                        What's the support level?
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-3 border-t border-gray-100 bg-white">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about risk exposure..."
                        className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
                    />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};
