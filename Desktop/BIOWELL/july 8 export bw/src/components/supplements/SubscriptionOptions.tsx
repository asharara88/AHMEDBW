import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingDown, Truck, Clock, Check } from 'lucide-react';

const SubscriptionOptions: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8 rounded-xl border border-primary/20 bg-primary/5 p-6"
    >
      <h2 className="mb-4 text-xl font-bold text-primary">Subscribe & Save</h2>
      <p className="mb-6 text-text-light">
        Never run out of your essential supplements. Subscribe for regular deliveries and enjoy exclusive benefits.
      </p>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-md dark:bg-gray-800">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <TrendingDown className="h-6 w-6" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Save 15%</h3>
          <p className="text-sm text-text-light">
            Subscribers automatically save 15% on every order compared to one-time purchases.
          </p>
        </div>
        
        <div className="rounded-xl bg-white p-5 shadow-md dark:bg-gray-800">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Calendar className="h-6 w-6" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Flexible Delivery</h3>
          <p className="text-sm text-text-light">
            Choose your delivery frequency: every 15, 30, 45, or 60 days. Adjust or cancel anytime.
          </p>
        </div>
        
        <div className="rounded-xl bg-white p-5 shadow-md dark:bg-gray-800">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Truck className="h-6 w-6" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Free Shipping</h3>
          <p className="text-sm text-text-light">
            All subscription orders ship for free, no minimum purchase required.
          </p>
        </div>
      </div>
      
      <div className="mt-6 rounded-xl bg-white p-5 shadow-md dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold">Choose Your Delivery Schedule</h3>
        
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {[
            { days: 15, label: 'Every 15 Days', recommended: false },
            { days: 30, label: 'Every 30 Days', recommended: true },
            { days: 45, label: 'Every 45 Days', recommended: false },
            { days: 60, label: 'Every 60 Days', recommended: false }
          ].map((option) => (
            <div 
              key={option.days}
              className={`relative cursor-pointer rounded-lg border p-4 transition-colors ${
                option.recommended 
                  ? 'border-primary bg-primary/5' 
                  : 'border-[hsl(var(--color-border))] hover:border-primary/30'
              }`}
            >
              {option.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-white">
                  Recommended
                </div>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold">{option.days} Days</div>
                  <div className="text-xs text-text-light">{option.label}</div>
                </div>
                {option.recommended && (
                  <div className="rounded-full bg-primary/10 p-1 text-primary">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex items-center gap-2 rounded-lg bg-[hsl(var(--color-surface-1))] p-3 text-sm text-text-light">
          <Clock className="h-4 w-4 text-primary" />
          <p>
            You can change or cancel your subscription at any time from your account settings.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default SubscriptionOptions;