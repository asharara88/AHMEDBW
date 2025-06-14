import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import ShoppingCartButton from '../../components/supplements/ShoppingCartButton';
import { ShoppingCartSidebar } from '../../components/supplements/ShoppingCartSidebar';
import { useCartContext } from '../../providers/CartProvider';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Lazy-load the supplements container
const SupplementsContainer = lazy(() => import('../../components/supplements/SupplementsContainer'));

const SupplementsPage = () => {
  const { isOpen, closeCart } = useCartContext();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Supplements</h1>
          <p className="text-text-light">
            Evidence-based supplements for your health goals
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <ShoppingCartButton />
        </div>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-9">
          <Suspense fallback={
            <div className="flex h-64 items-center justify-center">
              <LoadingSpinner size="large" />
              <span className="sr-only">Loading supplements...</span>
            </div>
          }>
            <SupplementsContainer />
          </Suspense>
        </div>
        
        <div className="lg:col-span-3">
          <ShoppingCartSidebar
            isOpen={isOpen}
            onClose={closeCart}
          />
        </div>
      </div>
    </div>
  );
};

export default SupplementsPage;