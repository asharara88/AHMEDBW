import { Shield } from 'lucide-react';
import { useCart } from './CartProvider';
import ImageWithFallback from '../common/ImageWithFallback';

interface CartSummaryProps {
  className?: string;
  showImages?: boolean;
}

const CartSummary = ({ className = '', showImages = true }: CartSummaryProps) => {
  const { items, total } = useCart();
  const shipping = items.length > 0 ? 15 : 0;
  const orderTotal = total + shipping;

  return (
    <div className={`rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4 sm:p-6 ${className}`}>
      <h2 className="mb-4 text-xl font-bold">Order Summary</h2>
      
      {items.length > 0 ? (
        <>
          <div className="mb-4 max-h-60 overflow-y-auto">
            {items.map((item) => (
              <div key={item.supplement.id} className="mb-3 flex items-center gap-3">
                {showImages && (
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md">
                    <ImageWithFallback
                      src={item.supplement.form_image_url || item.supplement.image_url}
                      alt={item.supplement.name}
                      className="h-full w-full object-cover"
                      fallbackSrc="https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="truncate text-sm font-medium">{item.supplement.name}</h4>
                  <p className="text-xs text-text-light">Qty: {item.quantity}</p>
                </div>
                <div className="text-sm font-medium">
                  AED {(item.supplement.price_aed * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          
          <div className="space-y-2 border-t border-[hsl(var(--color-border))] pt-4">
            <div className="flex justify-between">
              <span className="text-text-light">Subtotal</span>
              <span>AED {total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-light">Shipping</span>
              <span>AED {shipping.toFixed(2)}</span>
            </div>
            <div className="border-t border-[hsl(var(--color-border))] pt-2">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>AED {orderTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex items-center gap-2 rounded-lg bg-[hsl(var(--color-surface-1))] p-3">
            <Shield className="h-5 w-5 text-success" />
            <p className="text-sm text-text-light">
              Your payment is secure and your information is protected
            </p>
          </div>
        </>
      ) : (
        <div className="text-center py-6">
          <p className="text-text-light">Your cart is empty</p>
        </div>
      )}
    </div>
  );
};

export default CartSummary;