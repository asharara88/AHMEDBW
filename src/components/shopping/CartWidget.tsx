import { useState } from 'react';
import { ShoppingCart as ShoppingCartIcon } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import ShoppingCartComponent from '../supplements/ShoppingCart';
import CartButton from './CartButton';

const CartWidget = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { items } = useCartStore();
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <>
      <CartButton onClick={() => setIsCartOpen(true)} />
      
      <ShoppingCartComponent
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
      
      {/* Mobile floating cart button */}
      <div className="fixed bottom-4 right-4 z-40 md:hidden">
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-lg fixed-bottom"
          aria-label={`Shopping cart with ${itemCount} items`}
        >
          <ShoppingCartIcon className="h-8 w-8" />
          {itemCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-error text-sm font-bold text-white">
              {itemCount}
            </span>
          )}
        </button>
      </div>
    </>
  );
};

export default CartWidget;