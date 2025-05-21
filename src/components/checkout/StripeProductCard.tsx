import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSupabase } from '../../contexts/SupabaseContext';
import { stripeProducts } from '../../stripe-config';
import { AlertCircle, CheckCircle, CreditCard, Loader } from 'lucide-react';

interface StripeProductCardProps {
  productId: string;
  className?: string;
  buttonText?: string;
  showDetails?: boolean;
}

export default function StripeProductCard({
  productId,
  className = '',
  buttonText,
  showDetails = true
}: StripeProductCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { supabase } = useSupabase();
  const navigate = useNavigate();

  const product = stripeProducts[productId];

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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in to make a purchase');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          price_id: product.priceId,
          success_url: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/checkout/cancel`,
          mode: product.mode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'An error occurred during checkout');
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
            {buttonText || (product.mode === 'subscription' ? 'Subscribe Now' : 'Buy Now')}
          </>
        )}
      </button>
    </div>
  );
}