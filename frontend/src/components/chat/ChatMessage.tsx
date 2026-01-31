import React from 'react';

interface ChatMessageProps {
    sender: string;
    message: string;
    timestamp: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ sender, message, timestamp }) => {
    const isUser = sender === 'user';

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-[70%] ${isUser ? 'order-2' : 'order-1'}`}>
                <div
                    className={`rounded-lg px-4 py-2 ${isUser
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900 border border-gray-200'
                        }`}
                >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
                </div>
                <p className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
                    {new Date(timestamp).toLocaleTimeString()}
                </p>
            </div>
        </div>
    );
};

export default ChatMessage;
