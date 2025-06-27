import React from 'react';
import ChatMessage from './ChatMessage';
import RecommendationButton from './RecommendationButton';
import { useCartStore } from '../../store/cartStore';
import { Recommendation } from '../../types';

const ChatInterface: React.FC<{ messages: Array<{ text: string; recommendations: Recommendation[] }> }> = ({ messages }) => {
    const { addToCart } = useCartStore();

    return (
        <div className="chat-interface">
            {messages.map((message, index) => (
                <div key={index} className="chat-message">
                    <ChatMessage text={message.text} />
                    {message.recommendations.map((recommendation) => (
                        <RecommendationButton 
                            key={recommendation.id} 
                            recommendation={recommendation} 
                            onAddToCart={() => addToCart(recommendation)} 
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};

export default ChatInterface;