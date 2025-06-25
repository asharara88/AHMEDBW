import { useState, useEffect } from 'react';
import { useSupabase } from '../../contexts/SupabaseContext';
import { motion } from 'framer-motion';
import { Search, Filter, Grid3X3, List } from 'lucide-react';
import SupplementCard from './SupplementCard';
import type { Supplement } from '../../types/supplements';
import { useCartStore } from '../../store';

const SupplementList = () => {
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [userSupplements, setUserSupplements] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [evidenceFilter, setEvidenceFilter] = useState<'all' | 'green' | 'yellow'>('all');
  
  const { supabase } = useSupabase();
  const { addItem } = useCartStore();

  useEffect(() => {
    fetchSupplements();
  }, []);

  const fetchSupplements = async () => {
    try {
      setLoading(true);
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
      console.error('Error fetching supplements:', error);
      
      // Fallback data if fetch fails
      setSupplements([
        {
          id: 'magnesium-glycinate',
          name: 'Magnesium Glycinate',
          description: 'Premium form of magnesium for optimal absorption and sleep support.',
          categories: ['Sleep', 'Recovery', 'Stress'],
          evidence_level: 'Green',
          use_cases: ['Sleep quality', 'Muscle recovery', 'Stress management'],
          stack_recommendations: ['Sleep Stack', 'Recovery Stack'],
          dosage: '300-400mg before bed',
          form: 'Capsule',
          form_type: 'capsule_powder',
          brand: 'Pure Encapsulations',
          availability: true,
          price_aed: 89,
          image_url: 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg'
        },
        {
          id: 'vitamin-d3-k2',
          name: 'Vitamin D3 + K2',
          description: 'Synergistic combination for optimal calcium utilization and immune support.',
          categories: ['Immunity', 'Bone Health'],
          evidence_level: 'Green',
          use_cases: ['Immune support', 'Bone health', 'Cardiovascular health'],
          stack_recommendations: ['Immunity Stack', 'Bone Health Stack'],
          dosage: '5000 IU D3 / 100mcg K2',
          form: 'Softgel',
          form_type: 'softgel',
          brand: 'Thorne Research',
          availability: true,
          price_aed: 75,
          image_url: 'https://images.pexels.com/photos/4004612/pexels-photo-4004612.jpeg'
        },
        {
          id: 'ashwagandha',
          name: 'Ashwagandha KSM-66',
          description: 'Premium ashwagandha extract for stress and anxiety support.',
          categories: ['Stress', 'Sleep', 'Recovery'],
          evidence_level: 'Yellow',
          use_cases: ['Stress reduction', 'Sleep quality', 'Recovery'],
          stack_recommendations: ['Stress Stack', 'Sleep Stack'],
          dosage: '600mg daily',
          form: 'Capsule',
          form_type: 'capsule_powder',
          brand: 'Jarrow Formulas',
          availability: true,
          price_aed: 85,
          image_url: 'https://images.pexels.com/photos/3683051/pexels-photo-3683051.jpeg'
        }
      ]);
      setUserSupplements(['vitamin-d3-k2']);
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
      console.error('Error updating subscription:', error);
    }
  };

  const filteredSupplements = supplements.filter(supplement => {
    const matchesSearch = searchQuery === '' || 
      supplement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (supplement.description && supplement.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !selectedCategory || 
      (supplement.categories && supplement.categories.includes(selectedCategory));
    
    const matchesEvidence = evidenceFilter === 'all' || 
      (evidenceFilter === 'green' && supplement.evidence_level === 'Green') ||
      (evidenceFilter === 'yellow' && supplement.evidence_level === 'Yellow');
    
    return matchesSearch && matchesCategory && matchesEvidence;
  });

  // Extract unique categories from supplements
  const categories = Array.from(
    new Set(supplements.flatMap(s => s.categories || []))
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

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))]">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm transition-colors ${
                viewMode === 'grid'
                  ? 'bg-primary text-white'
                  : 'text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text'
              }`}
              aria-label="Grid view"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary text-white'
                  : 'text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text'
              }`}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          
          <div className="relative">
            <button
              className="flex items-center gap-1 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-1.5 text-sm text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
              onClick={() => document.getElementById('filter-dropdown')?.classList.toggle('hidden')}
            >
              <Filter className="h-4 w-4" />
              Filter
            </button>
            
            <div id="filter-dropdown" className="absolute right-0 mt-2 hidden w-48 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-3 shadow-lg z-10">
              <div className="mb-3">
                <h3 className="mb-2 text-xs font-medium">Evidence Level</h3>
                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="evidence"
                      checked={evidenceFilter === 'all'}
                      onChange={() => setEvidenceFilter('all')}
                      className="h-4 w-4 rounded border-[hsl(var(--color-border))] text-primary focus:ring-primary"
                    />
                    All
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="evidence"
                      checked={evidenceFilter === 'green'}
                      onChange={() => setEvidenceFilter('green')}
                      className="h-4 w-4 rounded border-[hsl(var(--color-border))] text-primary focus:ring-primary"
                    />
                    Green Tier Only
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="evidence"
                      checked={evidenceFilter === 'yellow'}
                      onChange={() => setEvidenceFilter('yellow')}
                      className="h-4 w-4 rounded border-[hsl(var(--color-border))] text-primary focus:ring-primary"
                    />
                    Yellow Tier Only
                  </label>
                </div>
              </div>
              
              <div>
                <h3 className="mb-2 text-xs font-medium">Categories</h3>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === null}
                      onChange={() => setSelectedCategory(null)}
                      className="h-4 w-4 rounded border-[hsl(var(--color-border))] text-primary focus:ring-primary"
                    />
                    All Categories
                  </label>
                  {categories.map((category) => (
                    <label key={category} className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === category}
                        onChange={() => setSelectedCategory(category)}
                        className="h-4 w-4 rounded border-[hsl(var(--color-border))] text-primary focus:ring-primary"
                      />
                      {category}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected filters display */}
      {(selectedCategory || evidenceFilter !== 'all') && (
        <div className="flex flex-wrap gap-2">
          {selectedCategory && (
            <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Category: {selectedCategory}
              <button 
                onClick={() => setSelectedCategory(null)}
                className="ml-1 rounded-full hover:bg-primary/20 p-0.5"
              >
                ✕
              </button>
            </div>
          )}
          {evidenceFilter !== 'all' && (
            <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Evidence: {evidenceFilter === 'green' ? 'Green Tier' : 'Yellow Tier'}
              <button 
                onClick={() => setEvidenceFilter('all')}
                className="ml-1 rounded-full hover:bg-primary/20 p-0.5"
              >
                ✕
              </button>
            </div>
          )}
          <button 
            onClick={() => {
              setSelectedCategory(null);
              setEvidenceFilter('all');
            }}
            className="text-xs text-primary hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {viewMode === 'grid' ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSupplements.map((supplement) => (
            <SupplementCard
              key={supplement.id}
              supplement={supplement}
              isInStack={userSupplements.includes(supplement.id)}
              onAddToStack={() => handleToggleSubscription(supplement.id)}
              onRemoveFromStack={() => handleToggleSubscription(supplement.id)}
              onViewDetails={() => {
                // Implement detailed view if needed
                console.log('View details for', supplement.name);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSupplements.map((supplement) => (
            <motion.div
              key={supplement.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex overflow-hidden rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))]"
            >
              <div className="h-24 w-24 flex-shrink-0 overflow-hidden">
                <ImageWithFallback
                  src={supplement.form_image_url || supplement.image_url}
                  alt={supplement.name}
                  className="h-full w-full object-contain"
                  fallbackSrc="https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg"
                />
              </div>
              
              <div className="flex flex-1 flex-col justify-between p-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{supplement.name}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      supplement.evidence_level === 'Green' ? 'bg-success/20 text-success' :
                      supplement.evidence_level === 'Yellow' ? 'bg-warning/20 text-warning' :
                      'bg-error/20 text-error'
                    }`}>
                      {supplement.evidence_level}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-text-light line-clamp-1">{supplement.description}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {supplement.categories?.slice(0, 3).map((category, index) => (
                      <span key={index} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-base font-bold">AED {supplement.price_aed.toFixed(2)}</div>
                  <div className="flex gap-2">
                    <button
                      onClick={userSupplements.includes(supplement.id) 
                        ? () => handleToggleSubscription(supplement.id)
                        : () => handleToggleSubscription(supplement.id)}
                      className={`flex items-center justify-center rounded-lg p-2 transition-colors ${
                        userSupplements.includes(supplement.id)
                          ? 'bg-error/20 text-error hover:bg-error/30'
                          : 'bg-[hsl(var(--color-surface-1))] text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text'
                      }`}
                      title={userSupplements.includes(supplement.id) ? "Remove from Stack" : "Add to Stack"}
                    >
                      <Heart className={`h-5 w-5 ${userSupplements.includes(supplement.id) ? 'fill-error' : ''}`} />
                    </button>
                    
                    <button
                      onClick={() => addItem(supplement)}
                      className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-dark"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {filteredSupplements.length === 0 && (
        <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-8 text-center">
          <p className="text-text-light">No supplements found matching your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default SupplementList;