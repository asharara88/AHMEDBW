import { ShoppingCart } from 'lucide-react';
import { useCart } from './CartProvider';

interface CartButtonProps {
  onClick: () => void;
  className?: string;
}

const CartButton = ({ onClick, className = '' }: CartButtonProps) => {
  const { items } = useCart();
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark ${className}`}
    >
      <ShoppingCart className="h-5 w-5" />
      <span className="hidden sm:inline">Cart</span>
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-primary">
        {itemCount}
      </span>
    </button>
  );
};

export default CartButton;