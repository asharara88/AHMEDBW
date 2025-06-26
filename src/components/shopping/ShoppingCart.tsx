import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart as ShoppingCartIcon, Minus, Plus, Trash2, ChevronRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import ImageWithFallback from '../common/ImageWithFallback';
import { useCartStore } from '../../store/useCartStore';

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShoppingCart = ({ isOpen, onClose }: ShoppingCartProps) => {
  const { items, total, updateQuantity, removeItem, clearCart } = useCartStore();
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping' | 'payment' | 'review'>('cart');
  
  const shipping = items.length > 0 ? 15 : 0;
  const orderTotal = total + shipping;

  const handleCheckout = () => {
    if (items.length === 0) return;
    setCheckoutStep('shipping');
  };

  const handleBackToCart = () => {
    setCheckoutStep('cart');
  };

  const handlePlaceOrder = () => {
    // Simulate order processing
    setTimeout(() => {
      clearCart();
      setCheckoutStep('cart');
      onClose();
      // Show success message or redirect to success page
      alert('Order placed successfully!');
    }, 1000);
  };

  return (
    <div className="h-full">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex justify-end bg-black/50"
            onClick={onClose}
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
                    <h2 className="text-lg font-bold">
                      {checkoutStep === 'cart' && 'Shopping Cart'}
                      {checkoutStep === 'shipping' && 'Shipping Information'}
                      {checkoutStep === 'payment' && 'Payment Information'}
                      {checkoutStep === 'review' && 'Review Order'}
                    </h2>
                    <button
                      onClick={onClose}
                      className="rounded-full p-2 text-text-light transition-colors hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
                      aria-label="Close cart"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {checkoutStep === 'cart' && (
                  <>
                    <div className="flex-1 overflow-y-auto">
                      {items.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                          <ShoppingCartIcon className="mb-4 h-12 w-12 text-text-light" />
                          <h3 className="mb-2 text-lg font-medium">Your cart is empty</h3>
                          <p className="text-sm text-text-light">
                            Add supplements to your cart to see them here.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4 p-4">
                          {items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3 dark:bg-[hsl(var(--color-card-hover))]"
                            >
                              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                                <ImageWithFallback
                                  src={item.image}
                                  alt={item.name}
                                  className="h-full w-full object-contain"
                                  fallbackSrc="https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="truncate text-sm font-medium">{item.name}</h4>
                                <p className="text-xs text-text-light">${item.price.toFixed(2)}</p>
                                <div className="mt-1 flex items-center">
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="rounded-l-md border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] px-2 py-1 text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text dark:bg-[hsl(var(--color-surface-1))]"
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </button>
                                  <span className="border-y border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] px-3 py-1 text-xs dark:bg-[hsl(var(--color-surface-1))]">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="rounded-r-md border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] px-2 py-1 text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text dark:bg-[hsl(var(--color-surface-1))]"
                                    aria-label="Increase quantity"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                                <button
                                  onClick={() => removeItem(item.id)}
                                  className="mt-1 text-text-light hover:text-error"
                                  aria-label={`Remove ${item.name} from cart`}
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
                          <span>${total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-light">Shipping</span>
                          <span>${shipping.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Total</span>
                          <span>${orderTotal.toFixed(2)}</span>
                        </div>
                      </div>
                      <button
                        onClick={handleCheckout}
                        className={`mb-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-white transition-colors hover:bg-primary-dark ${
                          items.length === 0 ? 'pointer-events-none opacity-50' : ''
                        }`}
                        disabled={items.length === 0}
                      >
                        Checkout
                        <ChevronRight className="h-4 w-4" />
                      </button>
                      <button
                        onClick={clearCart}
                        disabled={items.length === 0}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] px-4 py-2 text-sm font-medium transition-colors hover:bg-[hsl(var(--color-card-hover))] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[hsl(var(--color-surface-1))]"
                      >
                        Clear Cart
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                )}

                {checkoutStep === 'shipping' && (
                  <div className="flex-1 overflow-y-auto p-4">
                    <form className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-text-light">
                            First Name
                          </label>
                          <input
                            id="firstName"
                            type="text"
                            className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2 text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-text-light">
                            Last Name
                          </label>
                          <input
                            id="lastName"
                            type="text"
                            className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2 text-sm"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="mb-1 block text-sm font-medium text-text-light">
                          Email
                        </label>
                        <input
                          id="email"
                          type="email"
                          className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2 text-sm"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="address" className="mb-1 block text-sm font-medium text-text-light">
                          Address
                        </label>
                        <input
                          id="address"
                          type="text"
                          className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2 text-sm"
                          required
                        />
                      </div>
                      
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="city" className="mb-1 block text-sm font-medium text-text-light">
                            City
                          </label>
                          <input
                            id="city"
                            type="text"
                            className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2 text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="postalCode" className="mb-1 block text-sm font-medium text-text-light">
                            Postal Code
                          </label>
                          <input
                            id="postalCode"
                            type="text"
                            className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2 text-sm"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-between pt-4">
                        <button
                          type="button"
                          onClick={handleBackToCart}
                          className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] px-4 py-2 text-sm font-medium"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={() => setCheckoutStep('payment')}
                          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                        >
                          Continue to Payment
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {checkoutStep === 'payment' && (
                  <div className="flex-1 overflow-y-auto p-4">
                    <form className="space-y-4">
                      <div>
                        <label htmlFor="cardName" className="mb-1 block text-sm font-medium text-text-light">
                          Name on Card
                        </label>
                        <input
                          id="cardName"
                          type="text"
                          className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2 text-sm"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="cardNumber" className="mb-1 block text-sm font-medium text-text-light">
                          Card Number
                        </label>
                        <input
                          id="cardNumber"
                          type="text"
                          className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2 text-sm"
                          placeholder="1234 5678 9012 3456"
                          required
                        />
                      </div>
                      
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="expiry" className="mb-1 block text-sm font-medium text-text-light">
                            Expiry Date
                          </label>
                          <input
                            id="expiry"
                            type="text"
                            className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2 text-sm"
                            placeholder="MM/YY"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="cvv" className="mb-1 block text-sm font-medium text-text-light">
                            CVV
                          </label>
                          <input
                            id="cvv"
                            type="text"
                            className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2 text-sm"
                            placeholder="123"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-between pt-4">
                        <button
                          type="button"
                          onClick={() => setCheckoutStep('shipping')}
                          className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] px-4 py-2 text-sm font-medium"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={() => setCheckoutStep('review')}
                          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                        >
                          Review Order
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {checkoutStep === 'review' && (
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-4">
                      <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3">
                        <h3 className="mb-2 text-sm font-medium">Order Summary</h3>
                        <div className="space-y-2">
                          {items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span>{item.quantity} × {item.name}</span>
                              <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                          <div className="border-t border-[hsl(var(--color-border))] pt-2">
                            <div className="flex justify-between text-sm">
                              <span>Subtotal</span>
                              <span>${total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Shipping</span>
                              <span>${shipping.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-medium">
                              <span>Total</span>
                              <span>${orderTotal.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between">
                        <button
                          onClick={() => setCheckoutStep('payment')}
                          className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] px-4 py-2 text-sm font-medium"
                        >
                          Back
                        </button>
                        <button
                          onClick={handlePlaceOrder}
                          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                        >
                          Place Order
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4 sm:p-6">
          <div className="mb-4">
            <ShoppingCartIcon className="mx-auto h-12 w-12 text-primary/50 mb-4" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Your Cart</h3>
          <p className="mb-4 text-text-light">
            {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
          </p>
          <button 
            onClick={() => onClose()}
            className="w-full rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary-dark"
          >
            View Cart
          </button>
          
          {items.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium">Quick View</h4>
              {items.slice(0, 2).map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="truncate max-w-[70%]">{item.quantity} × {item.name}</span>
                  <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              {items.length > 2 && (
                <div className="text-xs text-text-light text-center">
                  + {items.length - 2} more items
                </div>
              )}
              <div className="pt-2 border-t border-[hsl(var(--color-border))]">
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;