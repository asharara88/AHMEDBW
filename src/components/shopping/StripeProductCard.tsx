import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AlertCircle, CheckCircle, CreditCard, Loader } from 'lucide-react';
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
}

// Basic product info used by the demo checkout flow
const products: Record<string, Product> = {
  subscription: {
    id: 'subscription',
    name: 'Biowell Subscription',
    description:
      'Subscribe to Biowell for personalized health coaching and supplement recommendations',
    price: 199,
  },
};

interface ProductCardProps {
  productId: string;
  className?: string;
  buttonText?: string;
  showDetails?: boolean;
}

// This component has been modified to remove Stripe integration
// It now serves as a placeholder for future payment integration
export default function ProductCard({
  productId,
  className = '',
  buttonText,
  showDetails = true
}: ProductCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const product = products[productId];

  if (!product) {
    return (
      <div className={`rounded-lg bg-error/10 p-3 text-sm text-error ${className}`}>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>Product not found: {productId}</p>
        </div>
      </div>
    );
  }

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login?redirect=pricing');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate checkout process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redirect to success page
      navigate('/checkout/success');
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError('An error occurred during checkout. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-6 ${className}`}>
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-error/10 p-3 text-sm text-error">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {showDetails && (
        <>
          <h3 className="mb-2 text-xl font-bold">{product.name}</h3>
          <p className="mb-4 text-text-light">{product.description}</p>
        </>
      )}

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
            {buttonText || 'Subscribe Now'}
          </>
        )}
      </button>
    </div>
  );
}