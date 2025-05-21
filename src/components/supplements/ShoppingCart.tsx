import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart as ShoppingCartIcon, Minus, Plus, Trash2, ChevronRight, CreditCard, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import ImageWithFallback from '../common/ImageWithFallback';
import { Supplement } from '../../types/supplements';

interface CartItem {
  supplement: Supplement;
  quantity: number;
}

interface ShoppingCartProps {
  cartItems: CartItem[];
  updateQuantity: (supplementId: string, quantity: number) => void;
  removeItem: (supplementId: string) => void;
  clearCart: () => void;
  total: number;
  isOpen: boolean;
  onClose: () => void;
}

const ShoppingCart = ({
  cartItems,
  updateQuantity,
  removeItem,
  clearCart,
  total,
  isOpen,
  onClose
}: ShoppingCartProps) => {
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping' | 'payment' | 'review'>('cart');
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    country: '',
    postalCode: ''
  });
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: ''
  });

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutStep('payment');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutStep('review');
  };

  const handlePlaceOrder = () => {
    alert('Order placed successfully!');
    clearCart();
    onClose();
    setCheckoutStep('cart');
  };

  const renderCartItems = () => (
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
  );

  const renderShippingForm = () => (
    <div className="flex-1 overflow-y-auto p-4">
      <h3 className="mb-4 text-lg font-medium">Shipping Information</h3>
      <form onSubmit={handleShippingSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-text-light">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              value={shippingInfo.firstName}
              onChange={(e) => setShippingInfo({ ...shippingInfo, firstName: e.target.value })}
              className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2 text-sm dark:bg-[hsl(var(--color-card-hover))]"
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
              value={shippingInfo.lastName}
              onChange={(e) => setShippingInfo({ ...shippingInfo, lastName: e.target.value })}
              className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2 text-sm dark:bg-[hsl(var(--color-card-hover))]"
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
            value={shippingInfo.email}
            onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
            className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2 text-sm dark:bg-[hsl(var(--color-card-hover))]"
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
            value={shippingInfo.address}
            onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
            className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2 text-sm dark:bg-[hsl(var(--color-card-hover))]"
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
              value={shippingInfo.city}
              onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
              className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2 text-sm dark:bg-[hsl(var(--color-card-hover))]"
              required
            />
          </div>
          <div>
            <label htmlFor="country" className="mb-1 block text-sm font-medium text-text-light">
              Country
            </label>
            <input
              id="country"
              type="text"
              value={shippingInfo.country}
              onChange={(e) => setShippingInfo({ ...shippingInfo, country: e.target.value })}
              className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2 text-sm dark:bg-[hsl(var(--color-card-hover))]"
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="postalCode" className="mb-1 block text-sm font-medium text-text-light">
            Postal Code
          </label>
          <input
            id="postalCode"
            type="text"
            value={shippingInfo.postalCode}
            onChange={(e) => setShippingInfo({ ...shippingInfo, postalCode: e.target.value })}
            className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2 text-sm dark:bg-[hsl(var(--color-card-hover))]"
            required
          />
        </div>
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() => setCheckoutStep('cart')}
            className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] px-4 py-2 text-sm font-medium dark:bg-[hsl(var(--color-surface-1))]"
          >
            Back to Cart
          </button>
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Continue to Payment
          </button>
        </div>
      </form>
    </div>
  );

  const renderPaymentForm = () => (
    <div className="flex-1 overflow-y-auto p-4">
      <h3 className="mb-4 text-lg font-medium">Payment Information</h3>
      <form onSubmit={handlePaymentSubmit} className="space-y-4">
        <div>
          <label htmlFor="cardName" className="mb-1 block text-sm font-medium text-text-light">
            Name on Card
          </label>
          <input
            id="cardName"
            type="text"
            value={paymentInfo.cardName}
            onChange={(e) => setPaymentInfo({ ...paymentInfo, cardName: e.target.value })}
            className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2 text-sm dark:bg-[hsl(var(--color-card-hover))]"
            required
          />
        </div>
        <div>
          <label htmlFor="cardNumber" className="mb-1 block text-sm font-medium text-text-light">
            Card Number
          </label>
          <div className="relative">
            <input
              id="cardNumber"
              type="text"
              value={paymentInfo.cardNumber}
              onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })}
              className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2 pl-10 text-sm dark:bg-[hsl(var(--color-card-hover))]"
              placeholder="1234 5678 9012 3456"
              required
            />
            <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-light" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="expiry" className="mb-1 block text-sm font-medium text-text-light">
              Expiry Date
            </label>
            <input
              id="expiry"
              type="text"
              value={paymentInfo.expiry}
              onChange={(e) => setPaymentInfo({ ...paymentInfo, expiry: e.target.value })}
              className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2 text-sm dark:bg-[hsl(var(--color-card-hover))]"
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
              value={paymentInfo.cvv}
              onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value })}
              className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2 text-sm dark:bg-[hsl(var(--color-card-hover))]"
              placeholder="123"
              required
            />
          </div>
        </div>
        <div className="p-3 bg-[hsl(var(--color-surface-1))] rounded-lg mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-success" />
          <p className="text-sm text-text-light">
            Your payment information is secure and encrypted
          </p>
        </div>
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() => setCheckoutStep('shipping')}
            className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] px-4 py-2 text-sm font-medium dark:bg-[hsl(var(--color-surface-1))]"
          >
            Back
          </button>
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Review Order
          </button>
        </div>
      </form>
    </div>
  );

  const renderOrderReview = () => (
    <div className="flex-1 overflow-y-auto p-4">
      <h3 className="mb-4 text-lg font-medium">Order Review</h3>
      
      <div className="mb-4 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3 dark:bg-[hsl(var(--color-card-hover))]">
        <h4 className="mb-2 text-sm font-medium">Shipping Information</h4>
        <p className="text-xs text-text-light">
          {shippingInfo.firstName} {shippingInfo.lastName}<br />
          {shippingInfo.address}<br />
          {shippingInfo.city}, {shippingInfo.country} {shippingInfo.postalCode}<br />
          {shippingInfo.email}
        </p>
      </div>
      
      <div className="mb-4 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3 dark:bg-[hsl(var(--color-card-hover))]">
        <h4 className="mb-2 text-sm font-medium">Payment Method</h4>
        <p className="text-xs text-text-light">
          <span className="font-medium">Card:</span> **** **** **** {paymentInfo.cardNumber.slice(-4) || '1234'}<br />
          <span className="font-medium">Name:</span> {paymentInfo.cardName}<br />
          <span className="font-medium">Expiry:</span> {paymentInfo.expiry}
        </p>
      </div>
      
      <div className="mb-4 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3 dark:bg-[hsl(var(--color-card-hover))]">
        <h4 className="mb-2 text-sm font-medium">Order Summary</h4>
        <div className="space-y-2">
          {cartItems.map((item) => (
            <div key={item.supplement.id} className="flex justify-between text-xs">
              <span>{item.quantity} x {item.supplement.name}</span>
              <span>AED {(item.supplement.price_aed * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 border-t border-[hsl(var(--color-border))] pt-2">
          <div className="flex justify-between text-xs">
            <span>Subtotal</span>
            <span>AED {total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>Shipping</span>
            <span>AED 15.00</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>AED {(total + 15).toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={() => setCheckoutStep('payment')}
          className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] px-4 py-2 text-sm font-medium dark:bg-[hsl(var(--color-surface-1))]"
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
  );

  const renderCheckoutProgress = () => (
    <div className="mb-4 flex items-center justify-between px-4 pt-4">
      <div className="flex items-center">
        <div className={`flex h-6 w-6 items-center justify-center rounded-full ${
          checkoutStep === 'cart' || checkoutStep === 'shipping' || checkoutStep === 'payment' || checkoutStep === 'review'
            ? 'bg-primary text-white'
            : 'bg-[hsl(var(--color-card-hover))] text-text-light'
        }`}>
          1
        </div>
        <div className={`h-0.5 w-4 ${
          checkoutStep === 'shipping' || checkoutStep === 'payment' || checkoutStep === 'review'
            ? 'bg-primary'
            : 'bg-[hsl(var(--color-border))]'
        }`}></div>
        <div className={`flex h-6 w-6 items-center justify-center rounded-full ${
          checkoutStep === 'shipping' || checkoutStep === 'payment' || checkoutStep === 'review'
            ? 'bg-primary text-white'
            : 'bg-[hsl(var(--color-card-hover))] text-text-light'
        }`}>
          2
        </div>
        <div className={`h-0.5 w-4 ${
          checkoutStep === 'payment' || checkoutStep === 'review'
            ? 'bg-primary'
            : 'bg-[hsl(var(--color-border))]'
        }`}></div>
        <div className={`flex h-6 w-6 items-center justify-center rounded-full ${
          checkoutStep === 'payment' || checkoutStep === 'review'
            ? 'bg-primary text-white'
            : 'bg-[hsl(var(--color-card-hover))] text-text-light'
        }`}>
          3
        </div>
        <div className={`h-0.5 w-4 ${
          checkoutStep === 'review'
            ? 'bg-primary'
            : 'bg-[hsl(var(--color-border))]'
        }`}></div>
        <div className={`flex h-6 w-6 items-center justify-center rounded-full ${
          checkoutStep === 'review'
            ? 'bg-primary text-white'
            : 'bg-[hsl(var(--color-card-hover))] text-text-light'
        }`}>
          4
        </div>
      </div>
    </div>
  );

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
                      {checkoutStep === 'shipping' && 'Checkout'}
                      {checkoutStep === 'payment' && 'Payment'}
                      {checkoutStep === 'review' && 'Review Order'}
                    </h2>
                    <button
                      onClick={onClose}
                      className="rounded-full p-2 text-text-light transition-colors hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  {checkoutStep !== 'cart' && renderCheckoutProgress()}
                </div>

                {checkoutStep === 'cart' && renderCartItems()}
                {checkoutStep === 'shipping' && renderShippingForm()}
                {checkoutStep === 'payment' && renderPaymentForm()}
                {checkoutStep === 'review' && renderOrderReview()}

                {checkoutStep === 'cart' && (
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
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
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