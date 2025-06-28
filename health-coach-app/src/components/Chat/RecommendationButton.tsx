import React from 'react';
import { useCartStore } from '../../store/cartStore';

interface RecommendationButtonProps {
    recommendation: string;
}

const RecommendationButton: React.FC<RecommendationButtonProps> = ({ recommendation }) => {
    const addToCart = useCartStore(state => state.addToCart);

    const handleAddToCart = () => {
        addToCart(recommendation);
    };

    return (
        <button onClick={handleAddToCart}>
            (Add to Stack)
        </button>
    );
};

export default RecommendationButton;