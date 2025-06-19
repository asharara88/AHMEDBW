import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart as ShoppingCartIcon, Minus, Plus, Trash2, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ImageWithFallback from '../common/ImageWithFallback';
import { useCart } from './CartProvider';

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShoppingCart = ({
  isOpen,
  onClose
}: ShoppingCartProps) => {
  const { items, total, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();
  
  const handleCheckout = () => {
    if (items.length === 0) return;
    onClose();
    navigate('/checkout');
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
                    <h2 className="text-lg font-bold">Shopping Cart</h2>
                    <button
                      onClick={onClose}
                      className="rounded-full p-2 text-text-light transition-colors hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

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
                          key={item.supplement.id}
                          className="flex items-center gap-3 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3 dark:bg-[hsl(var(--color-card-hover))]"
                        >
                          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                            <ImageWithFallback
                              src={item.supplement.form_image_url || item.supplement.image_url}
                              alt={item.supplement.name}
                              className="h-full w-full object-cover"
                              fallbackSrc="https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="truncate text-sm font-medium">{item.supplement.name}</h4>
                            <p className="text-xs text-text-light">AED {item.supplement.price_aed}</p>
                            <div className="mt-1 flex items-center">
                              <button
                                onClick={() => updateQuantity(item.supplement.id, item.quantity - 1)}
                                className="rounded-l-md border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] px-2 py-1 text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text dark:bg-[hsl(var(--color-surface-1))]"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="border-y border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] px-3 py-1 text-xs dark:bg-[hsl(var(--color-surface-1))]">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.supplement.id, item.quantity + 1)}
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
                      <span>{items.length > 0 ? 'AED 15.00' : 'AED 0.00'}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>AED {items.length > 0 ? (total + 15).toFixed(2) : '0.00'}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className={`mb-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-white transition-colors hover:bg-primary-dark ${
                      items.length === 0 ? 'pointer-events-none opacity-50' : ''
                    }`}
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
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;