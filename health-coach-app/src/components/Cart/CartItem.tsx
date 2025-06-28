import React from 'react';
import { useCartStore } from '../../store/cartStore';
import { CartItem as CartItemType } from '../../types';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const removeItem = useCartStore((state) => state.removeItem);

  const handleRemove = () => {
    removeItem(item.id);
  };

  return (
    <div className="cart-item">
      <h4>{item.name}</h4>
      <p>{item.description}</p>
      <button onClick={handleRemove}>Remove</button>
    </div>
  );
};

export default CartItem;