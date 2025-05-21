import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Shield, ArrowRight, CreditCard, Building, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSupabase } from '../../contexts/SupabaseContext';
import { useAuth } from '../../contexts/AuthContext';
import StripeCheckout from '../checkout/StripeCheckout';

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  
  const { supabase } = useSupabase();
  const { user } = useAuth();

  const plans = [
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
      price: isAnnual ? "229 AED/month" : "299 AED/month",
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

  const handlePlanSelect = (planId: string) => {
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = '/login?redirect=pricing';
      return;
    }
    
    setSelectedPlan(planId);
    setShowCheckout(true);
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
          <div className="mx-auto max-w-md">
            <div className="rounded-xl bg-[hsl(var(--color-card))] p-6 shadow-lg">
              <h3 className="mb-4 text-xl font-bold">Complete Your Subscription</h3>
              <p className="mb-6 text-text-light">You're subscribing to the {selectedPlan === 'pro' ? 'Pro' : 'Essential'} plan.</p>
              
              <StripeCheckout 
                productId="subscription"
                onSuccess={() => {
                  setShowCheckout(false);
                  setSelectedPlan(null);
                }}
                onCancel={() => {
                  setShowCheckout(false);
                  setSelectedPlan(null);
                }}
              />
              
              <button
                onClick={() => setShowCheckout(false)}
                className="mt-4 w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-4 py-2 text-text-light hover:bg-[hsl(var(--color-card-hover))]"
              >
                Cancel
              </button>
            </div>
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
                    onClick={() => handlePlanSelect(plan.id)}
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