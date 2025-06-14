import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSupabase } from '../../contexts/SupabaseContext';
import { useAuth } from '../../contexts/AuthContext';
import { Package, Search, Filter, Grid3X3, List } from 'lucide-react';
import SupplementList from '../../components/supplements/SupplementList';
import SupplementRecommender from '../../components/supplements/SupplementRecommender';
import StackBuilder from '../../components/supplements/StackBuilder';
import ShoppingCartSidebar from '../../components/supplements/ShoppingCartSidebar';
import ShoppingCartButton from '../../components/supplements/ShoppingCartButton';
import { useCartContext } from '../../providers/CartProvider';
import { Supplement } from '../../types/supplements';
import dataService from '../../services/dataService';

const SupplementsPage = () => {
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [userSupplements, setUserSupplements] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'recommendations' | 'stacks'>('all');
  
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const { items, isOpen, closeCart } = useCartContext();
  
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
      
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-9">
          {activeTab === 'all' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SupplementList 
                supplements={supplements}
                userSupplements={userSupplements}
                onToggleSubscription={handleToggleSubscription}
                loading={loading}
              />
            </motion.div>
          )}
          
          {activeTab === 'recommendations' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SupplementRecommender />
            </motion.div>
          )}
          
          {activeTab === 'stacks' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <StackBuilder 
                supplements={supplements}
                userSupplements={userSupplements}
                onToggleSubscription={handleToggleSubscription}
              />
            </motion.div>
          )}
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