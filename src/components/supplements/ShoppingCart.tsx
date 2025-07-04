import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart as ShoppingCartIcon, Minus, Plus, Trash2, ChevronRight } from 'lucide-react';
import ImageWithFallback from '../common/ImageWithFallback';
import { Supplement } from '../../types/supplements';

interface CartItem {
  supplement: Supplement;
  quantity: number;
}

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShoppingCart = ({
  isOpen,
  onClose
}: ShoppingCartProps) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [, setCheckoutStep] = useState<'cart' | 'shipping' | 'payment' | 'review'>('cart');

  const total = cartItems.reduce((sum, item) => sum + (item.supplement.price_aed * item.quantity), 0);

  const updateQuantity = (supplementId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems(cartItems.filter(item => item.supplement.id !== supplementId));
      return;
    }
    
    setCartItems(cartItems.map(item => 
      item.supplement.id === supplementId 
        ? { ...item, quantity } 
        : item
    ));
  };

  const removeItem = (supplementId: string) => {
    setCartItems(cartItems.filter(item => item.supplement.id !== supplementId));
  };

  const clearCart = () => {
    setCartItems([]);
  };


  const handleCheckout = () => {
    alert('Order placed successfully!');
    clearCart();
    onClose();
  };

  return (
    <div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="h-full w-full max-w-md overflow-hidden bg-[hsl(var(--color-card))] shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex h-full flex-col">
                <div className="border-b border-[hsl(var(--color-border))] p-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold">Shopping Cart</h2>
                    <button
                      onClick={onClose}
                      title="Close shopping cart"
                      className="rounded-full p-2 text-text-light transition-colors hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {cartItems.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                      <ShoppingCartIcon className="mb-4 h-12 w-12 text-text-light" />
                      <h3 className="mb-2 text-lg font-medium">Your cart is empty</h3>
                      <p className="text-sm text-text-light">
                        Add supplements to your cart to see them here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 p-4">
                      {cartItems.map((item) => (
                        <div
                          key={item.supplement.id}
                          className="flex items-center gap-3 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3 dark:bg-[hsl(var(--color-card-hover))]"
                        >
                          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                            <ImageWithFallback
                              src={item.supplement.form_image_url || item.supplement.image_url}
                              alt={item.supplement.name}
                              className="h-full w-full object-contain"
                              fallbackSrc="https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="truncate text-sm font-medium">{item.supplement.name}</h4>
                            <p className="text-xs text-text-light">AED {item.supplement.price_aed.toFixed(2)}</p>
                            <div className="mt-1 flex items-center">
                              <button
                                onClick={() => updateQuantity(item.supplement.id, item.quantity - 1)}
                                title="Decrease quantity"
                                className="rounded-l-md border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] px-2 py-1 text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text dark:bg-[hsl(var(--color-surface-1))]"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="border-y border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] px-3 py-1 text-xs dark:bg-[hsl(var(--color-surface-1))]">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.supplement.id, item.quantity + 1)}
                                title="Increase quantity"
                                className="rounded-r-md border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] px-2 py-1 text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text dark:bg-[hsl(var(--color-surface-1))]"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="font-medium">AED {(item.supplement.price_aed * item.quantity).toFixed(2)}</span>
                            <button
                              onClick={() => removeItem(item.supplement.id)}
                              title="Remove item from cart"
                              className="mt-1 text-text-light hover:text-error"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-[hsl(var(--color-border))] p-4">
                  <div className="mb-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-text-light">Subtotal</span>
                      <span>AED {total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-light">Shipping</span>
                      <span>{cartItems.length > 0 ? 'AED 15.00' : 'AED 0.00'}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>AED {cartItems.length > 0 ? (total + 15).toFixed(2) : '0.00'}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => cartItems.length > 0 && setCheckoutStep('shipping')}
                    className={`mb-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-white transition-colors hover:bg-primary-dark ${
                      cartItems.length === 0 ? 'pointer-events-none opacity-50' : ''
                    }`}
                  >
                    Checkout
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={clearCart}
                    disabled={cartItems.length === 0}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] px-4 py-2 text-sm font-medium transition-colors hover:bg-[hsl(var(--color-card-hover))] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[hsl(var(--color-surface-1))]"
                  >
                    Clear Cart
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4 sm:p-6">
          <div className="mb-4">
                  <button
                    onClick={() => cartItems.length > 0 && handleCheckout()}
                    className={`mb-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-white transition-colors hover:bg-primary-dark ${
                      cartItems.length === 0 ? 'pointer-events-none opacity-50' : ''
                    }`}
                  >
                    View Cart
                    <ChevronRight className="h-4 w-4" />
                  </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;