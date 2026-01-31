import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import ChatMessage from './ChatMessage';
import { useChatService } from '../../hooks/useChatService';

interface ChatWindowProps {
    symbol: string;
}

interface Message {
    id: string;
    sender: string;
    message: string;
    timestamp: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ symbol }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { loadHistory, sendMessage, loading } = useChatService();

    useEffect(() => {
        // Load chat history when symbol changes
        const fetchHistory = async () => {
            try {
                const history = await loadHistory(symbol);
                setMessages(history);
            } catch (error) {
                console.error('Failed to load chat history:', error);
            }
        };
        fetchHistory();
    }, [symbol]);

    useEffect(() => {
        // Auto-scroll to bottom when new messages arrive
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || loading) return;

        const userMessageText = inputMessage.trim();
        setInputMessage('');

        try {
            const result = await sendMessage(symbol, userMessageText);
            // Add both user and assistant messages
            setMessages((prev) => [...prev, result.userMessage, result.assistantMessage]);
        } catch (error) {
            console.error('Failed to send message:', error);
            // Optionally show error toast
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border">
            {/* Header */}
            <div className="px-6 py-4 border-b bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">Chat: {symbol}</h3>
                <p className="text-sm text-gray-500">Ask questions about this position</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        <p>No messages yet. Start a conversation!</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <ChatMessage
                            key={msg.id}
                            sender={msg.sender}
                            message={msg.message}
                            timestamp={msg.timestamp}
                        />
                    ))
                )}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-lg px-4 py-2 flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                            <span className="text-sm text-gray-500">Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-6 py-4 border-t bg-gray-50">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your question..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
