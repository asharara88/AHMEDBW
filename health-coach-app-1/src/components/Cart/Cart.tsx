import React from 'react';
import { useCartStore } from '../../store/cartStore';
import CartItem from './CartItem';

const Cart: React.FC = () => {
    const { cartItems } = useCartStore();

    return (
        <div>
            <h2>Your Cart</h2>
            {cartItems.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <ul>
                    {cartItems.map(item => (
                        <CartItem key={item.id} item={item} />
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Cart;