import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, CreditCard, Loader } from 'lucide-react';

interface CheckoutProps {
  productId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  buttonText?: string;
  className?: string;
}

// This component has been modified to remove Stripe integration
// It now serves as a placeholder for future payment integration
export default function Checkout({
  productId,
  onSuccess,
  onCancel,
  buttonText = 'Subscribe Now',
  className = ''
}: CheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate checkout process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
      
      // Simulate redirect after successful checkout
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/checkout/success');
        }
      }, 1000);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError('An error occurred during checkout. Please try again later.');
      if (onCancel) onCancel();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-error/10 p-3 text-sm text-error">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success ? (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-success">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <p>Payment successful! Redirecting...</p>
        </div>
      ) : (
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader className="h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-5 w-5" />
              {buttonText}
            </>
          )}
        </button>
      )}
    </div>
  );
}