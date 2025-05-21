import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';

const CheckoutSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Simulate verification process
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    // Auto-redirect after success
    const redirectTimer = setTimeout(() => {
      navigate('/dashboard');
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(redirectTimer);
    };
  }, [navigate]);

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-md rounded-xl bg-[hsl(var(--color-card))] p-8 shadow-lg"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center text-center">
            <Loader className="mb-4 h-12 w-12 animate-spin text-primary" />
            <h2 className="mb-2 text-xl font-bold">Verifying your payment</h2>
            <p className="text-text-light">
              Please wait while we confirm your payment...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
            
            <h2 className="mb-2 text-2xl font-bold">Payment Successful!</h2>
            <p className="mb-6 text-text-light">
              Thank you for your purchase. Your subscription has been activated.
            </p>
            
            <div className="mb-6 w-full rounded-lg bg-[hsl(var(--color-surface-1))] p-4 text-left">
              <h3 className="mb-2 font-medium">Order Details</h3>
              <p className="text-sm text-text-light">
                <strong>Order ID:</strong> {sessionId?.substring(0, 8) || 'N/A'}<br />
                <strong>Status:</strong> Completed<br />
                <strong>Date:</strong> {new Date().toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex w-full flex-col gap-3">
              <Link
                to="/dashboard"
                className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-white hover:bg-primary-dark"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              
              <Link
                to="/supplements"
                className="flex items-center justify-center gap-2 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-4 py-3 font-medium text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
              >
                Browse Supplements
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CheckoutSuccessPage;