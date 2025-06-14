import { ShoppingCart } from 'lucide-react';
import { useCartContext } from '../../providers/CartProvider';

interface ShoppingCartButtonProps {
  className?: string;
}

export default function ShoppingCartButton({ className = '' }: ShoppingCartButtonProps) {
  const { itemCount, openCart } = useCartContext();
  
  return (
    <button
      onClick={openCart}
      className={`relative flex items-center gap-2 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] px-4 py-2 text-sm font-medium transition-colors hover:bg-[hsl(var(--color-card-hover))] ${className}`}
      aria-label="Open shopping cart"
    >
      <ShoppingCart className="h-5 w-5" />
      <span>Cart</span>
      {itemCount > 0 && (
        <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
          {itemCount}
        </span>
      )}
    </button>
  );
}