import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Send, Loader2, AlertCircle } from 'lucide-react';
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

export interface ChatWindowRef {
    sendQuickMessage: (message: string) => Promise<void>;
}

const ChatWindow = forwardRef<ChatWindowRef, ChatWindowProps>(({ symbol }, ref) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { loadHistory, sendMessage, loading, error } = useChatService();

    // Expose sendQuickMessage to parent via ref
    useImperativeHandle(ref, () => ({
        sendQuickMessage: async (message: string) => {
            await handleSendMessage(message);
        },
    }));

    useEffect(() => {
        // Load chat history when symbol changes
        const fetchHistory = async () => {
            try {
                setErrorMessage(null);
                const history = await loadHistory(symbol);
                setMessages(history);
            } catch (error) {
                console.error('Failed to load chat history:', error);
                setErrorMessage('Failed to load chat history');
            }
        };
        fetchHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [symbol]); // Only depend on symbol to avoid infinite loop

    useEffect(() => {
        // Auto-scroll to bottom when new messages arrive
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (messageText?: string) => {
        const textToSend = messageText || inputMessage.trim();
        if (!textToSend || loading) return;

        setInputMessage('');
        setErrorMessage(null);

        try {
            const result = await sendMessage(symbol, textToSend);
            // Add both user and assistant messages
            setMessages((prev) => [...prev, result.userMessage, result.assistantMessage]);
        } catch (error) {
            console.error('Failed to send message:', error);
            setErrorMessage('Failed to send message. Please try again.');
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

            {/* Error Banner */}
            {(errorMessage || error) && (
                <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-sm text-red-700">{errorMessage || error}</p>
                    <button
                        onClick={() => setErrorMessage(null)}
                        className="ml-auto text-red-600 hover:text-red-800"
                    >
                        ×
                    </button>
                </div>
            )}

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
                        onClick={() => handleSendMessage()}
                        disabled={!inputMessage.trim() || loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
});

ChatWindow.displayName = 'ChatWindow';

export default ChatWindow;
