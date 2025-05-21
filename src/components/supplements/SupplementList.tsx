import { useState, useEffect } from 'react';
import { useSupabase } from '../../contexts/SupabaseContext';
import { logError } from '../../utils/logger';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import SupplementCard from './SupplementCard';
import type { Supplement } from '../../types/supplements';

const SupplementList = () => {
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [userSupplements, setUserSupplements] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const { supabase } = useSupabase();

  useEffect(() => {
    fetchSupplements();
  }, []);

  const fetchSupplements = async () => {
    try {
      const { data: supplementsData, error: supplementsError } = await supabase
        .from('supplements')
        .select('*')
        .order('name');

      if (supplementsError) throw supplementsError;
      setSupplements(supplementsData || []);

      const { data: userSupplementsData, error: userSupplementsError } = await supabase
        .from('user_supplements')
        .select('supplement_id');

      if (userSupplementsError) throw userSupplementsError;
      setUserSupplements(userSupplementsData?.map(us => us.supplement_id) || []);
    } catch (error) {
      logError('Error fetching supplements', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSubscription = async (supplementId: string) => {
    const isSubscribed = userSupplements.includes(supplementId);

    try {
      if (isSubscribed) {
        await supabase
          .from('user_supplements')
          .delete()
          .eq('supplement_id', supplementId);
        
        setUserSupplements(prev => prev.filter(id => id !== supplementId));
      } else {
        await supabase
          .from('user_supplements')
          .insert({ supplement_id: supplementId });
        
        setUserSupplements(prev => [...prev, supplementId]);
      }
    } catch (error) {
      logError('Error updating subscription', error);
    }
  };

  const filteredSupplements = supplements.filter(supplement => {
    const matchesSearch = searchQuery === '' || 
      supplement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplement.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || 
      supplement.categories.includes(selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(
    new Set(supplements.flatMap(s => s.categories))
  ).sort();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-light" />
          <input
            type="text"
            placeholder="Search supplements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] pl-10 pr-4 py-2 text-text placeholder:text-text-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              !selectedCategory
                ? 'bg-primary text-white'
                : 'bg-[hsl(var(--color-card))] text-text-light hover:bg-[hsl(var(--color-card-hover))]'
            }`}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-primary text-white'
                  : 'bg-[hsl(var(--color-card))] text-text-light hover:bg-[hsl(var(--color-card-hover))]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredSupplements.map((supplement) => (
          <SupplementCard
            key={supplement.id}
            supplement={supplement}
            isInStack={userSupplements.includes(supplement.id)}
            onAddToStack={() => handleToggleSubscription(supplement.id)}
            onRemoveFromStack={() => handleToggleSubscription(supplement.id)}
          />
        ))}
      </div>

      {filteredSupplements.length === 0 && (
        <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-8 text-center">
          <p className="text-text-light">No supplements found matching your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default SupplementList;