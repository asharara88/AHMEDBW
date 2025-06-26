import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import ShoppingCart from '../supplements/ShoppingCart';
import CartButton from './CartButton';

const CartWidget = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { items } = useCartStore();
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <>
      <CartButton onClick={() => setIsCartOpen(true)} />
      
      <ShoppingCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
      
      {/* Mobile floating cart button */}
      <div className="fixed bottom-4 right-4 z-40 md:hidden">
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg"
          aria-label={`Shopping cart with ${itemCount} items`}
        >
          <ShoppingCart className="h-6 w-6" />
          {itemCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-error text-xs font-bold text-white">
              {itemCount}
            </span>
          )}
        </button>
      </div>
    </>
  );
};

export default CartWidget;