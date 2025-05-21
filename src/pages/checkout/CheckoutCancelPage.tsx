import { motion } from 'framer-motion';
import { XCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const CheckoutCancelPage = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-md rounded-xl bg-[hsl(var(--color-card))] p-8 shadow-lg"
      >
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-error/10">
            <XCircle className="h-10 w-10 text-error" />
          </div>
          
          <h2 className="mb-2 text-2xl font-bold">Payment Cancelled</h2>
          <p className="mb-6 text-text-light">
            Your payment was cancelled. No charges were made to your account.
          </p>
          
          <div className="flex w-full flex-col gap-3">
            <Link
              to="/pricing"
              className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-white hover:bg-primary-dark"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Pricing
            </Link>
            
            <Link
              to="/dashboard"
              className="flex items-center justify-center gap-2 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-4 py-3 font-medium text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CheckoutCancelPage;