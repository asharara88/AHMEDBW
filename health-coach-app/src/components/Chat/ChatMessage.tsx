import React from 'react';
import { Recommendation } from '../../types';
import RecommendationButton from './RecommendationButton';

interface ChatMessageProps {
    message: string;
    recommendations?: Recommendation[];
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, recommendations }) => {
    return (
        <div className="chat-message">
            <p>{message}</p>
            {recommendations && recommendations.length > 0 && (
                <div className="recommendations">
                    {recommendations.map((rec) => (
                        <div key={rec.id} className="recommendation">
                            <span>{rec.text}</span>
                            <RecommendationButton recommendation={rec} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ChatMessage;