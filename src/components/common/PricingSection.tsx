import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Shield, ArrowRight, CreditCard, Building, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSupabase } from '../../contexts/SupabaseContext';
import { useAuth } from '../../contexts/AuthContext';

interface Plan {
  id: string;
  name: string;
  price: string;
  features: string[];
  buttonText: string;
  buttonLink: string;
  isPopular?: boolean;
  tag?: string;
}

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'shipping' | 'payment' | 'review'>('shipping');
  const [loading, setLoading] = useState(false);
  
  const { supabase } = useSupabase();
  const { user } = useAuth();
  
  // Shipping information state
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    building: '',
    street: '',
    area: '',
    city: '',
    emirate: 'Dubai',
    postalCode: ''
  });
  
  // Payment information state
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
    saveCard: false
  });

  const plans: Plan[] = [
    {
      id: "essential",
      name: "Essential",
      price: isAnnual ? "159 AED/month" : "199 AED/month",
      tag: "Essential",
      features: [
        "Sync your devices",
        "Health data analytics",
        "Personalized recommendations",
        "Community Access"
      ],
      buttonText: "Subscribe Now",
      buttonLink: "/checkout/essential"
    },
    {
      id: "pro",
      name: "Pro",
      price: isAnnual ? "239 AED/month" : "299 AED/month",
      tag: "Most Popular",
      isPopular: true,
      features: [
        "All Essential features, plus:",
        "Advanced health insights",
        "Unlimited device integration",
        "Priority email & chat support",
        "Up to 15% discount on supplements"
      ],
      buttonText: "Subscribe Now",
      buttonLink: "/checkout/pro"
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "Custom Pricing",
      tag: "For Teams",
      features: [
        "All Pro features, plus:",
        "Custom integrations & APIs",
        "Dedicated account manager",
        "24/7 Priority support"
      ],
      buttonText: "Contact Sales",
      buttonLink: "/contact-sales"
    }
  ];

  const addToCart = async (planId: string) => {
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = '/login?redirect=pricing';
      return;
    }
    
    setSelectedPlan(planId);
    setShowCheckout(true);
    setCheckoutStep('shipping');
    
    // In a real implementation, you would add the plan to the cart in your database
    try {
      // Example API call to add plan to cart
      // const { error } = await supabase
      //   .from('carts')
      //   .upsert({ 
      //     user_id: user.id,
      //     plan_id: planId,
      //     is_annual: isAnnual
      //   });
      
      // if (error) throw error;
      
      console.log(`Added plan ${planId} to cart with annual billing: ${isAnnual}`);
    } catch (error) {
      console.error('Error adding plan to cart:', error);
    }
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutStep('payment');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutStep('review');
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    
    try {
      // In a real implementation, you would process the payment and create the subscription
      // Example API call to process payment
      // const { data, error } = await supabase.functions.invoke('process-payment', {
      //   body: {
      //     planId: selectedPlan,
      //     isAnnual,
      //     shippingInfo,
      //     paymentInfo: {
      //       ...paymentInfo,
      //       cardNumber: paymentInfo.cardNumber.replace(/\s/g, ''),
      //       cvv: undefined // Don't send CVV to the server
      //     }
      //   }
      // });
      
      // if (error) throw error;
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      // Reset checkout state
      setShowCheckout(false);
      setSelectedPlan(null);
      setCheckoutStep('shipping');
      
      // Show success message or redirect to success page
      alert('Your subscription has been processed successfully!');
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('There was an error processing your payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderCheckoutForm = () => {
    if (!selectedPlan) return null;
    
    const selectedPlanDetails = plans.find(plan => plan.id === selectedPlan);
    
    if (!selectedPlanDetails) return null;
    
    switch (checkoutStep) {
      case 'shipping':
        return (
          <div className="bg-[hsl(var(--color-card))] p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold mb-6">Shipping Information</h2>
            <form onSubmit={handleShippingSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">First Name</label>
                  <input
                    type="text"
                    value={shippingInfo.firstName}
                    onChange={(e) => setShippingInfo({...shippingInfo, firstName: e.target.value})}
                    className="w-full p-2 border rounded bg-[hsl(var(--color-surface-1))] text-text border-[hsl(var(--color-border))]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Last Name</label>
                  <input
                    type="text"
                    value={shippingInfo.lastName}
                    onChange={(e) => setShippingInfo({...shippingInfo, lastName: e.target.value})}
                    className="w-full p-2 border rounded bg-[hsl(var(--color-surface-1))] text-text border-[hsl(var(--color-border))]"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-text-light mb-1">Mobile Number</label>
                <input
                  type="tel"
                  value={shippingInfo.mobile}
                  onChange={(e) => setShippingInfo({...shippingInfo, mobile: e.target.value})}
                  placeholder="+971 50 123 4567"
                  className="w-full p-2 border rounded bg-[hsl(var(--color-surface-1))] text-text border-[hsl(var(--color-border))]"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-text-light mb-1">Building/Villa</label>
                <input
                  type="text"
                  value={shippingInfo.building}
                  onChange={(e) => setShippingInfo({...shippingInfo, building: e.target.value})}
                  className="w-full p-2 border rounded bg-[hsl(var(--color-surface-1))] text-text border-[hsl(var(--color-border))]"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-text-light mb-1">Street</label>
                <input
                  type="text"
                  value={shippingInfo.street}
                  onChange={(e) => setShippingInfo({...shippingInfo, street: e.target.value})}
                  className="w-full p-2 border rounded bg-[hsl(var(--color-surface-1))] text-text border-[hsl(var(--color-border))]"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Area</label>
                  <input
                    type="text"
                    value={shippingInfo.area}
                    onChange={(e) => setShippingInfo({...shippingInfo, area: e.target.value})}
                    className="w-full p-2 border rounded bg-[hsl(var(--color-surface-1))] text-text border-[hsl(var(--color-border))]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">City</label>
                  <input
                    type="text"
                    value={shippingInfo.city}
                    onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                    className="w-full p-2 border rounded bg-[hsl(var(--color-surface-1))] text-text border-[hsl(var(--color-border))]"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Emirate</label>
                  <select
                    value={shippingInfo.emirate}
                    onChange={(e) => setShippingInfo({...shippingInfo, emirate: e.target.value})}
                    className="w-full p-2 border rounded bg-[hsl(var(--color-surface-1))] text-text border-[hsl(var(--color-border))]"
                    required
                  >
                    <option value="Abu Dhabi">Abu Dhabi</option>
                    <option value="Dubai">Dubai</option>
                    <option value="Sharjah">Sharjah</option>
                    <option value="Ajman">Ajman</option>
                    <option value="Umm Al Quwain">Umm Al Quwain</option>
                    <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                    <option value="Fujairah">Fujairah</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={shippingInfo.postalCode}
                    onChange={(e) => setShippingInfo({...shippingInfo, postalCode: e.target.value})}
                    className="w-full p-2 border rounded bg-[hsl(var(--color-surface-1))] text-text border-[hsl(var(--color-border))]"
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => setShowCheckout(false)}
                  className="px-4 py-2 border border-[hsl(var(--color-border))] rounded-lg text-text-light hover:bg-[hsl(var(--color-card-hover))]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                >
                  Continue to Payment
                </button>
              </div>
            </form>
          </div>
        );
        
      case 'payment':
        return (
          <div className="bg-[hsl(var(--color-card))] p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold mb-6">Payment Information</h2>
            <form onSubmit={handlePaymentSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-text-light mb-1">Name on Card</label>
                <input
                  type="text"
                  value={paymentInfo.cardName}
                  onChange={(e) => setPaymentInfo({...paymentInfo, cardName: e.target.value})}
                  className="w-full p-2 border rounded bg-[hsl(var(--color-surface-1))] text-text border-[hsl(var(--color-border))]"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-text-light mb-1">Card Number</label>
                <div className="relative">
                  <input
                    type="text"
                    value={paymentInfo.cardNumber}
                    onChange={(e) => setPaymentInfo({...paymentInfo, cardNumber: e.target.value})}
                    placeholder="1234 5678 9012 3456"
                    className="w-full p-2 pl-10 border rounded bg-[hsl(var(--color-surface-1))] text-text border-[hsl(var(--color-border))]"
                    required
                  />
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light h-4 w-4" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Expiry Date</label>
                  <input
                    type="text"
                    value={paymentInfo.expiry}
                    onChange={(e) => setPaymentInfo({...paymentInfo, expiry: e.target.value})}
                    placeholder="MM/YY"
                    className="w-full p-2 border rounded bg-[hsl(var(--color-surface-1))] text-text border-[hsl(var(--color-border))]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">CVV</label>
                  <input
                    type="text"
                    value={paymentInfo.cvv}
                    onChange={(e) => setPaymentInfo({...paymentInfo, cvv: e.target.value})}
                    placeholder="123"
                    className="w-full p-2 border rounded bg-[hsl(var(--color-surface-1))] text-text border-[hsl(var(--color-border))]"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  id="saveCard"
                  checked={paymentInfo.saveCard}
                  onChange={(e) => setPaymentInfo({...paymentInfo, saveCard: e.target.checked})}
                  className="h-4 w-4 text-primary border-[hsl(var(--color-border))] rounded focus:ring-primary"
                />
                <label htmlFor="saveCard" className="ml-2 text-sm text-text-light">
                  Save this card for future payments
                </label>
              </div>
              
              <div className="p-3 bg-[hsl(var(--color-surface-1))] rounded-lg mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-success" />
                <p className="text-sm text-text-light">
                  Your payment information is secure and encrypted
                </p>
              </div>
              
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => setCheckoutStep('shipping')}
                  className="px-4 py-2 border border-[hsl(var(--color-border))] rounded-lg text-text-light hover:bg-[hsl(var(--color-card-hover))]"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                >
                  Review Order
                </button>
              </div>
            </form>
          </div>
        );
        
      case 'review':
        return (
          <div className="bg-[hsl(var(--color-card))] p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold mb-6">Review Your Order</h2>
            
            <div className="mb-6 space-y-4">
              <div className="p-4 border border-[hsl(var(--color-border))] rounded-lg bg-[hsl(var(--color-surface-1))]">
                <h3 className="font-medium mb-2">Selected Plan</h3>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{selectedPlanDetails.name}</p>
                    <p className="text-text-light text-sm">{selectedPlanDetails.price}</p>
                    <p className="text-text-light text-sm">{isAnnual ? 'Annual billing' : 'Monthly billing'}</p>
                  </div>
                  <div className="text-primary font-medium">
                    {isAnnual ? selectedPlanDetails.price.replace('/month', ' × 12') : selectedPlanDetails.price}
                  </div>
                </div>
              </div>
              
              <div className="p-4 border border-[hsl(var(--color-border))] rounded-lg bg-[hsl(var(--color-surface-1))]">
                <h3 className="font-medium mb-2">Shipping Information</h3>
                <p className="text-text-light text-sm">
                  {shippingInfo.firstName} {shippingInfo.lastName}<br />
                  {shippingInfo.building}, {shippingInfo.street}<br />
                  {shippingInfo.area}, {shippingInfo.city}<br />
                  {shippingInfo.emirate}, {shippingInfo.postalCode}<br />
                  {shippingInfo.mobile}
                </p>
              </div>
              
              <div className="p-4 border border-[hsl(var(--color-border))] rounded-lg bg-[hsl(var(--color-surface-1))]">
                <h3 className="font-medium mb-2">Payment Method</h3>
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-text-light mr-2" />
                  <p className="text-text-light text-sm">
                    **** **** **** {paymentInfo.cardNumber.slice(-4) || '1234'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border border-[hsl(var(--color-border))] rounded-lg bg-[hsl(var(--color-surface-1))] mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-text-light">Subtotal</span>
                <span>{selectedPlanDetails.price}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-text-light">VAT (5%)</span>
                <span>
                  {isAnnual 
                    ? `${(parseFloat(selectedPlanDetails.price.split(' ')[0]) * 0.05).toFixed(2)} AED/month`
                    : `${(parseFloat(selectedPlanDetails.price.split(' ')[0]) * 0.05).toFixed(2)} AED`
                  }
                </span>
              </div>
              <div className="border-t border-[hsl(var(--color-border))] my-2 pt-2 flex justify-between font-medium">
                <span>Total</span>
                <span>
                  {isAnnual 
                    ? `${(parseFloat(selectedPlanDetails.price.split(' ')[0]) * 1.05).toFixed(2)} AED/month`
                    : `${(parseFloat(selectedPlanDetails.price.split(' ')[0]) * 1.05).toFixed(2)} AED`
                  }
                </span>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setCheckoutStep('payment')}
                className="px-4 py-2 border border-[hsl(var(--color-border))] rounded-lg text-text-light hover:bg-[hsl(var(--color-card-hover))]"
              >
                Back
              </button>
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Confirm Subscription'
                )}
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <section className="bg-background-alt py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Simple, Transparent Pricing</h2>
          <p className="mb-8 text-text-light">
            Choose the plan that best fits your health optimization journey
          </p>
          
          {/* Billing Toggle */}
          <div className="mb-8 flex items-center justify-center gap-4">
            <span className={`text-sm ${!isAnnual ? 'text-text' : 'text-text-light'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative h-6 w-12 rounded-full transition-colors ${
                isAnnual ? 'bg-primary' : 'bg-gray-300'
              }`}
              aria-label={isAnnual ? 'Switch to monthly billing' : 'Switch to annual billing'}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${isAnnual ? 'text-text' : 'text-text-light'}`}>
                Annual
              </span>
              <span className="rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
                Save 20%
              </span>
            </div>
          </div>
        </motion.div>

        {showCheckout ? (
          <div className="mx-auto max-w-2xl">
            {renderCheckoutForm()}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative overflow-hidden rounded-2xl border ${
                  plan.isPopular
                    ? 'border-primary bg-primary/5'
                    : 'border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))]'
                } p-6 shadow-lg transition-shadow hover:shadow-xl`}
              >
                {plan.tag && (
                  <div className={`absolute right-0 top-0 ${
                    plan.isPopular 
                      ? 'bg-primary text-white' 
                      : plan.tag === 'Essential'
                        ? 'bg-secondary text-white'
                        : 'bg-gray-700 text-white'
                  } px-4 py-1 text-xs font-medium`}>
                    {plan.tag}
                  </div>
                )}

                <div className="mb-6">
                  <div className="flex items-center gap-2">
                    {plan.id === 'essential' && <User className="h-5 w-5 text-secondary" />}
                    {plan.id === 'pro' && <Shield className="h-5 w-5 text-primary" />}
                    {plan.id === 'enterprise' && <Building className="h-5 w-5 text-gray-700" />}
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                  </div>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-3xl font-bold">{plan.price.split('/')[0]}</span>
                    {plan.price.includes('/') && (
                      <span className="ml-2 text-text-light">
                        /{plan.price.split('/')[1]}
                      </span>
                    )}
                  </div>
                  {plan.price.includes('month') && isAnnual && (
                    <p className="mt-1 text-sm text-success">Save 20% with annual billing</p>
                  )}
                </div>

                <div className="mb-6 space-y-4">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2">
                      <Check className="mt-1 h-4 w-4 flex-shrink-0 text-success" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {plan.id === 'enterprise' ? (
                  <Link
                    to={plan.buttonLink}
                    className={`block w-full rounded-xl px-6 py-3 text-center font-medium transition-colors ${
                      plan.isPopular
                        ? 'bg-primary text-white hover:bg-primary-dark'
                        : 'bg-[hsl(var(--color-card-hover))] hover:bg-[hsl(var(--color-border))]'
                    }`}
                  >
                    {plan.buttonText}
                  </Link>
                ) : (
                  <button
                    onClick={() => addToCart(plan.id)}
                    className={`block w-full rounded-xl px-6 py-3 text-center font-medium transition-colors ${
                      plan.isPopular
                        ? 'bg-primary text-white hover:bg-primary-dark'
                        : 'bg-[hsl(var(--color-card-hover))] hover:bg-[hsl(var(--color-border))]'
                    }`}
                  >
                    {plan.buttonText}
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Money Back Guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-[hsl(var(--color-card))] p-4 text-center"
        >
          <Shield className="h-5 w-5 text-success" />
          <p className="text-text-light">
            All plans include a 14-day money-back guarantee. No questions asked.
          </p>
        </motion.div>

        {/* Feature Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-16 max-w-6xl"
        >
          <h2 className="mb-8 text-center text-2xl font-bold">Feature Comparison</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse">
              <thead>
                <tr className="border-b border-[hsl(var(--color-border))]">
                  <th className="py-4 text-left font-medium text-text-light">Features</th>
                  <th className="py-4 text-center font-medium text-text-light">Essential</th>
                  <th className="py-4 text-center font-medium text-text-light">Pro</th>
                  <th className="py-4 text-center font-medium text-text-light">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))]">
                  <td className="py-4 font-medium">Health Dashboard</td>
                  <td className="py-4 text-center"><Check className="mx-auto h-5 w-5 text-success" /></td>
                  <td className="py-4 text-center"><Check className="mx-auto h-5 w-5 text-success" /></td>
                  <td className="py-4 text-center"><Check className="mx-auto h-5 w-5 text-success" /></td>
                </tr>
                <tr className="border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-card-hover))]">
                  <td className="py-4 font-medium">Wearable Integration</td>
                  <td className="py-4 text-center"><Check className="mx-auto h-5 w-5 text-success" /></td>
                  <td className="py-4 text-center"><Check className="mx-auto h-5 w-5 text-success" /></td>
                  <td className="py-4 text-center"><Check className="mx-auto h-5 w-5 text-success" /></td>
                </tr>
                <tr className="border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))]">
                  <td className="py-4 font-medium">AI Health Coach</td>
                  <td className="py-4 text-center"><span className="text-sm">Basic</span></td>
                  <td className="py-4 text-center"><span className="text-sm">Advanced</span></td>
                  <td className="py-4 text-center"><span className="text-sm">Custom</span></td>
                </tr>
                <tr className="border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-card-hover))]">
                  <td className="py-4 font-medium">Supplement Recommendations</td>
                  <td className="py-4 text-center"><span className="text-sm">Basic</span></td>
                  <td className="py-4 text-center"><span className="text-sm">Personalized</span></td>
                  <td className="py-4 text-center"><span className="text-sm">Custom</span></td>
                </tr>
                <tr className="border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))]">
                  <td className="py-4 font-medium">Metabolic Insights</td>
                  <td className="py-4 text-center"><span className="text-text-light">—</span></td>
                  <td className="py-4 text-center"><Check className="mx-auto h-5 w-5 text-success" /></td>
                  <td className="py-4 text-center"><Check className="mx-auto h-5 w-5 text-success" /></td>
                </tr>
                <tr className="border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-card-hover))]">
                  <td className="py-4 font-medium">Priority Support</td>
                  <td className="py-4 text-center"><span className="text-text-light">—</span></td>
                  <td className="py-4 text-center"><Check className="mx-auto h-5 w-5 text-success" /></td>
                  <td className="py-4 text-center"><Check className="mx-auto h-5 w-5 text-success" /></td>
                </tr>
                <tr className="border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))]">
                  <td className="py-4 font-medium">Team Analytics</td>
                  <td className="py-4 text-center"><span className="text-text-light">—</span></td>
                  <td className="py-4 text-center"><span className="text-text-light">—</span></td>
                  <td className="py-4 text-center"><Check className="mx-auto h-5 w-5 text-success" /></td>
                </tr>
                <tr className="border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-card-hover))]">
                  <td className="py-4 font-medium">API Access</td>
                  <td className="py-4 text-center"><span className="text-text-light">—</span></td>
                  <td className="py-4 text-center"><span className="text-text-light">—</span></td>
                  <td className="py-4 text-center"><Check className="mx-auto h-5 w-5 text-success" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="mx-auto mt-16 max-w-3xl rounded-xl bg-gradient-to-r from-primary to-secondary p-8 text-center text-white"
        >
          <h2 className="mb-4 text-2xl font-bold">Ready to optimize your health?</h2>
          <p className="mb-6">
            Join thousands of users who have transformed their health journey with Biowell.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-medium text-primary transition-colors hover:bg-white/90"
          >
            Get Started Today
            <ArrowRight className="h-5 w-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;