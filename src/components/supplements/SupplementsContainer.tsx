import { useState, useEffect, lazy, Suspense } from 'react';
import { useSupabase } from '../../contexts/SupabaseContext';
import { useAuth } from '../../contexts/AuthContext';
import { Package, Search, Grid3X3 } from 'lucide-react';
import { Supplement } from '../../types/supplements';
import dataService from '../../services/dataService';
import LoadingSpinner from '../common/LoadingSpinner';

// Lazy-loaded components
const SupplementList = lazy(() => import('./SupplementList'));
const SupplementRecommender = lazy(() => import('./SupplementRecommender'));
const StackBuilder = lazy(() => import('./StackBuilder'));

interface SupplementsContainerProps {
  initialTab?: 'all' | 'recommendations' | 'stacks';
}

export default function SupplementsContainer({ initialTab = 'all' }: SupplementsContainerProps) {
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [userSupplements, setUserSupplements] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'recommendations' | 'stacks'>(initialTab);
  
  const { supabase } = useSupabase();
  const { user } = useAuth();
  
  useEffect(() => {
    fetchSupplements();
  }, []);
  
  const fetchSupplements = async () => {
    try {
      setLoading(true);
      
      // Fetch supplements
      const supplements = await dataService.getSupplements();
      setSupplements(supplements);
      
      // Fetch user supplements
      if (user) {
        const userSupps = await dataService.getUserSupplements(user.id);
        setUserSupplements(userSupps);
      }
    } catch (err) {
      console.error('Error fetching supplements:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleToggleSubscription = async (supplementId: string) => {
    if (!user) return;
    
    const isSubscribed = userSupplements.includes(supplementId);
    
    try {
      if (isSubscribed) {
        // Remove subscription
        await supabase
          .from('user_supplements')
          .delete()
          .eq('user_id', user.id)
          .eq('supplement_id', supplementId);
        
        setUserSupplements(userSupplements.filter(id => id !== supplementId));
      } else {
        // Add subscription
        await supabase
          .from('user_supplements')
          .insert({
            user_id: user.id,
            supplement_id: supplementId,
            subscription_active: true
          });
        
        setUserSupplements([...userSupplements, supplementId]);
      }
    } catch (err) {
      console.error('Error toggling subscription:', err);
    }
  };
  
  return (
    <>
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-primary text-white'
              : 'bg-[hsl(var(--color-card))] text-text-light hover:bg-[hsl(var(--color-card-hover))]'
          }`}
        >
          <Package className="h-4 w-4" />
          All Supplements
        </button>
        
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'recommendations'
              ? 'bg-primary text-white'
              : 'bg-[hsl(var(--color-card))] text-text-light hover:bg-[hsl(var(--color-card-hover))]'
          }`}
        >
          <Search className="h-4 w-4" />
          Recommendations
        </button>
        
        <button
          onClick={() => setActiveTab('stacks')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'stacks'
              ? 'bg-primary text-white'
              : 'bg-[hsl(var(--color-card))] text-text-light hover:bg-[hsl(var(--color-card-hover))]'
          }`}
        >
          <Grid3X3 className="h-4 w-4" />
          My Stacks
        </button>
      </div>
      
      {/* Lazy-loaded tab content with suspense fallbacks */}
      {activeTab === 'all' && (
        <Suspense fallback={
          <div className="h-64 flex items-center justify-center">
            <LoadingSpinner size="large" />
          </div>
        }>
          <SupplementList 
            supplements={supplements}
            userSupplements={userSupplements}
            onToggleSubscription={handleToggleSubscription}
            loading={loading}
          />
        </Suspense>
      )}
      
      {activeTab === 'recommendations' && (
        <Suspense fallback={
          <div className="h-64 flex items-center justify-center">
            <LoadingSpinner size="large" />
          </div>
        }>
          <SupplementRecommender />
        </Suspense>
      )}
      
      {activeTab === 'stacks' && (
        <Suspense fallback={
          <div className="h-64 flex items-center justify-center">
            <LoadingSpinner size="large" />
          </div>
        }>
          <StackBuilder 
            supplements={supplements}
            userSupplements={userSupplements}
            onToggleSubscription={handleToggleSubscription}
          />
        </Suspense>
      )}
    </>
  );
}