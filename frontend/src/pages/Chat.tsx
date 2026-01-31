import React, { useState, useRef } from 'react';
import { MessageSquare } from 'lucide-react';
import ChatWindow from '../components/chat/ChatWindow';
import type { ChatWindowRef } from '../components/chat/ChatWindow';

const Chat: React.FC = () => {
    const [selectedSymbol, setSelectedSymbol] = useState<string>('TCS');
    const chatWindowRef = useRef<ChatWindowRef>(null);

    // In a real app, this would come from the portfolio
    const stocksWithChats = ['TCS', 'INFY', 'RELIANCE', 'HDFC', 'ICICI'];

    const quickQuestions = [
        'Why did you suggest this action?',
        "What's my current risk exposure?",
        'Show me alternative stocks',
        'What are the key risk factors?',
        'How does this compare to my other positions?',
    ];

    const handleQuickQuestion = (question: string) => {
        chatWindowRef.current?.sendQuickMessage(question);
    };

    return (
        <div className="p-6 h-[calc(100vh-4rem)]">
            <div className="flex gap-6 h-full">
                {/* Sidebar */}
                <div className="w-64 bg-white rounded-lg shadow-sm border p-4 flex-shrink-0">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Stock Chats</h2>
                    <div className="space-y-2">
                        {stocksWithChats.map((symbol) => (
                            <button
                                key={symbol}
                                onClick={() => setSelectedSymbol(symbol)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${selectedSymbol === symbol
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'hover:bg-gray-50 text-gray-700'
                                    }`}
                            >
                                <MessageSquare className="w-5 h-5" />
                                <span className="font-medium">{symbol}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col gap-4">
                    <ChatWindow ref={chatWindowRef} symbol={selectedSymbol} />

                    {/* Quick Questions */}
                    <div className="bg-white rounded-lg shadow-sm border p-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Questions</h3>
                        <div className="flex flex-wrap gap-2">
                            {quickQuestions.map((question, index) => (
                                <button
                                    key={index}
                                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-sm text-gray-700 rounded-lg transition-colors"
                                    onClick={() => handleQuickQuestion(question)}
                                >
                                    {question}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;
