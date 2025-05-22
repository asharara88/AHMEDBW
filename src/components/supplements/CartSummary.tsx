import { ShoppingCart } from 'lucide-react';

interface CartSummaryProps {
  itemCount: number;
  onViewCart: () => void;
}

export default function CartSummary({ itemCount, onViewCart }: CartSummaryProps) {
  return (
    <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4 sm:p-6">
      <div className="mb-4">
        <ShoppingCart className="mx-auto h-12 w-12 text-primary/50 mb-4" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">Your Cart</h3>
      <p className="mb-4 text-text-light">
        {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
      </p>
      <button
        onClick={onViewCart}
        className="w-full rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary-dark"
      >
        View Cart
      </button>
    </div>
  );
}
