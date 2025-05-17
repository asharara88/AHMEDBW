import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, CreditCard, Truck, ShoppingBag, Check, Shield, ArrowLeft } from 'lucide-react';
import { Supplement } from '../../types/supplements';
import ImageWithFallback from '../common/ImageWithFallback';

interface CartItem {
  supplement: Supplement;
  quantity: number;
}

interface CheckoutFormProps {
  cartItems: CartItem[];
  onCheckoutComplete: () => void;
  onBack: () => void;
}

const CheckoutForm = ({ cartItems, onCheckoutComplete, onBack }: CheckoutFormProps) => {
  const [step, setStep] = useState<'shipping' | 'payment' | 'review'>('shipping');
  const [loading, setLoading] = useState(false);
  
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    saveInfo: true
  });
  
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
    saveCard: false
  });

  const subtotal = cartItems.reduce((total, item) => 
    total + (item.supplement.price_aed * item.quantity), 0
  );
  
  const shipping = cartItems.length > 0 ? 15 : 0;
  const total = subtotal + shipping;

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
    window.scrollTo(0, 0);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('review');
    window.scrollTo(0, 0);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    
    try {
      // In a real app, send order to API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message and redirect
      alert('Order placed successfully! Thank you for your purchase.');
      onCheckoutComplete();
    } catch (error) {
      console.error('Error placing order:', error);
      alert('There was an error processing your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-text-light hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Shopping
        </button>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">Checkout</h1>
      </div>

      {/* Checkout Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <div className="flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
              <Truck className="h-5 w-5" />
            </div>
            <div className={`h-1 w-8 sm:w-16 md:w-24 ${step === 'shipping' || step === 'payment' || step === 'review' ? 'bg-primary' : 'bg-gray-200'}`}></div>
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${step === 'payment' || step === 'review' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'}`}>
              <CreditCard className="h-5 w-5" />
            </div>
            <div className={`h-1 w-8 sm:w-16 md:w-24 ${step === 'review' ? 'bg-primary' : 'bg-gray-200'}`}></div>
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${step === 'review' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'}`}>
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="mt-2 flex justify-center">
          <div className="flex w-full max-w-md justify-between px-4">
            <span className={`text-sm ${step === 'shipping' ? 'font-medium text-primary' : 'text-text-light'}`}>Shipping</span>
            <span className={`text-sm ${step === 'payment' ? 'font-medium text-primary' : 'text-text-light'}`}>Payment</span>
            <span className={`text-sm ${step === 'review' ? 'font-medium text-primary' : 'text-text-light'}`}>Review</span>
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2">
          {step === 'shipping' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4 sm:p-6"
            >
              <h2 className="mb-6 text-xl font-bold">Shipping Information</h2>
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
                      className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2"
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
                      className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2"
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
                    className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2"
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
                    className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2"
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
                      className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2"
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
                      className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2"
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
                    className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2"
                    required
                  />
                </div>
                <div className="flex items-center">
                  <input
                    id="saveInfo"
                    type="checkbox"
                    checked={shippingInfo.saveInfo}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, saveInfo: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="saveInfo" className="ml-2 text-sm text-text-light">
                    Save this information for next time
                  </label>
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-white hover:bg-primary-dark"
                  >
                    Continue to Payment
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {step === 'payment' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4 sm:p-6"
            >
              <h2 className="mb-6 text-xl font-bold">Payment Information</h2>
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
                    className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2"
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
                      className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2 pl-10"
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
                      className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2"
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
                      className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2"
                      placeholder="123"
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    id="saveCard"
                    type="checkbox"
                    checked={paymentInfo.saveCard}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, saveCard: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="saveCard" className="ml-2 text-sm text-text-light">
                    Save this card for future purchases
                  </label>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-[hsl(var(--color-surface-1))] p-3">
                  <Shield className="h-5 w-5 text-success" />
                  <p className="text-sm text-text-light">
                    Your payment information is secure and encrypted
                  </p>
                </div>
                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep('shipping')}
                    className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] px-4 py-2 font-medium"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-primary-dark"
                  >
                    Review Order
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {step === 'review' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4 sm:p-6"
            >
              <h2 className="mb-6 text-xl font-bold">Review Your Order</h2>
              
              <div className="mb-6 space-y-4">
                <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-4">
                  <h3 className="mb-2 text-lg font-medium">Shipping Information</h3>
                  <p className="text-text-light">
                    {shippingInfo.firstName} {shippingInfo.lastName}<br />
                    {shippingInfo.address}<br />
                    {shippingInfo.city}, {shippingInfo.country} {shippingInfo.postalCode}<br />
                    {shippingInfo.email}
                  </p>
                </div>
                
                <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-4">
                  <h3 className="mb-2 text-lg font-medium">Payment Method</h3>
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-text-light" />
                    <p className="text-text-light">
                      **** **** **** {paymentInfo.cardNumber.slice(-4) || '1234'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="mb-4 text-lg font-medium">Order Items</h3>
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div
                      key={item.supplement.id}
                      className="flex items-center gap-3 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3"
                    >
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                        <ImageWithFallback
                          src={item.supplement.form_image_url || item.supplement.image_url}
                          alt={item.supplement.name}
                          className="h-full w-full object-cover"
                          fallbackSrc="https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.supplement.name}</h4>
                        <p className="text-sm text-text-light">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">AED {(item.supplement.price_aed * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mb-6 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-4">
                <h3 className="mb-2 text-lg font-medium">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-light">Subtotal</span>
                    <span>AED {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-light">Shipping</span>
                    <span>AED {shipping.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-[hsl(var(--color-border))] pt-2">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>AED {total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={() => setStep('payment')}
                  className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] px-4 py-2 font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Place Order
                      <Check className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Order Summary */}
        <div className="md:col-span-1">
          <div className="sticky top-24 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4 sm:p-6">
            <h2 className="mb-4 text-xl font-bold">Order Summary</h2>
            
            <div className="mb-4 max-h-60 overflow-y-auto">
              {cartItems.map((item) => (
                <div key={item.supplement.id} className="mb-3 flex items-center gap-3">
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md">
                    <ImageWithFallback
                      src={item.supplement.form_image_url || item.supplement.image_url}
                      alt={item.supplement.name}
                      className="h-full w-full object-cover"
                      fallbackSrc="https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg"
                    />
                  </div>
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
                <span>AED {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-light">Shipping</span>
                <span>AED {shipping.toFixed(2)}</span>
              </div>
              <div className="border-t border-[hsl(var(--color-border))] pt-2">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>AED {total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex items-center gap-2 rounded-lg bg-[hsl(var(--color-surface-1))] p-3">
              <Shield className="h-5 w-5 text-success" />
              <p className="text-sm text-text-light">
                Your payment is secure and your information is protected
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;