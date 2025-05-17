import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../../contexts/SupabaseContext';
import { Package, ChevronDown, ChevronUp, Plus, Check, AlertCircle } from 'lucide-react';
import ImageWithFallback from '../common/ImageWithFallback';
import { getSupplementFormImage } from '../../utils/supplementForms';

interface SupplementRecommendationsProps {
  userId: string;
}

const SupplementRecommendations = ({ userId }: SupplementRecommendationsProps) => {
  const [supplements, setSupplements] = useState<any[]>([]);
  const [userSupplements, setUserSupplements] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllSupplements, setShowAllSupplements] = useState(false);
  const [expandedSupplement, setExpandedSupplement] = useState<string | null>(null);
  
  const { supabase } = useSupabase();
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchSupplements();
  }, []);

  const fetchSupplements = async () => {
    try {
      const { data: suppData, error: suppError } = await supabase
        .from('supplements')
        .select('*')
        .limit(5);
      
      if (suppError) throw suppError;
      
      const { data: userSuppData, error: userSuppError } = await supabase
        .from('user_supplements')
        .select('supplement_id')
        .eq('user_id', userId);
      
      if (userSuppError) throw userSuppError;
      
      setSupplements(suppData || []);
      setUserSupplements(userSuppData?.map(us => us.supplement_id) || []);
    } catch (error) {
      console.error('Error fetching supplements:', error);
      
      // Fallback data
      setSupplements([
        {
          id: '1',
          name: 'Magnesium Glycinate',
          description: 'Supports sleep quality, muscle recovery, and stress reduction.',
          benefits: ['Sleep', 'Stress', 'Recovery'],
          dosage: '300-400mg before bed',
          price: 34.99,
          image_url: 'https://images.pexels.com/photos/139655/pexels-photo-139655.jpeg?auto=compress&cs=tinysrgb&w=800',
          form_type: 'capsule_powder'
        },
        {
          id: '2',
          name: 'Vitamin D3 + K2',
          description: 'Supports bone health, immune function, and mood regulation.',
          benefits: ['Immunity', 'Bone Health', 'Mood'],
          dosage: '5000 IU daily with fat-containing meal',
          price: 29.99,
          image_url: 'https://images.pexels.com/photos/4004612/pexels-photo-4004612.jpeg?auto=compress&cs=tinysrgb&w=800',
          form_type: 'softgel'
        },
        {
          id: '3',
          name: 'Omega-3 Fish Oil',
          description: 'Supports heart health, brain function, and reduces inflammation.',
          benefits: ['Heart', 'Brain', 'Inflammation'],
          dosage: '1-2g daily with food',
          price: 39.99,
          image_url: 'https://images.pexels.com/photos/9751994/pexels-photo-9751994.jpeg?auto=compress&cs=tinysrgb&w=800',
          form_type: 'softgel'
        },
      ]);
      setUserSupplements(['2']);
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
          .insert({ supplement_id: supplementId, user_id: userId });
        
        setUserSupplements(prev => [...prev, supplementId]);
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl bg-[hsl(var(--color-card))] p-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Show only first 2 supplements on mobile by default
  const visibleSupplements = showAllSupplements ? supplements : supplements.slice(0, 2);

  return (
    <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold sm:text-lg">Recommended Supplements</h2>
          <p className="text-sm text-text-light">Based on your health data</p>
        </div>
        <button
          onClick={() => setShowAllSupplements(!showAllSupplements)}
          className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary sm:hidden"
        >
          {showAllSupplements ? 'Show Less' : `Show All (${supplements.length})`}
          {showAllSupplements ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      <div className="space-y-3">
        {visibleSupplements.map((supplement) => {
          const isSubscribed = userSupplements.includes(supplement.id);
          const formImageUrl = supplement.form_image_url || getSupplementFormImage(supplement.form_type);
          
          return (
            <div
              key={supplement.id}
              className="overflow-hidden rounded-lg"
            >
              {/* Card with image and content in one row */}
              <div className="flex bg-[hsl(var(--color-surface-1))]">
                {/* Image container - no border, fixed height and width */}
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden">
                  <ImageWithFallback
                    src={formImageUrl}
                    alt={supplement.name}
                    className="h-full w-full object-contain"
                    fallbackSrc="https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg"
                  />
                </div>
                
                {/* Content container */}
                <div className="flex flex-1 flex-col justify-between p-3">
                  <div>
                    <h3 className="text-sm font-medium">{supplement.name}</h3>
                    <p className="text-xs text-text-light line-clamp-1">{supplement.dosage}</p>
                  </div>
                  
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs font-medium">AED {supplement.price}</span>
                    <button
                      onClick={() => handleToggleSubscription(supplement.id)}
                      className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                        isSubscribed
                          ? 'bg-error/10 text-error hover:bg-error/20'
                          : 'bg-primary text-white hover:bg-primary-dark'
                      }`}
                    >
                      {isSubscribed ? (
                        <>
                          <Check className="h-3 w-3" />
                          Remove
                        </>
                      ) : (
                        <>
                          <Plus className="h-3 w-3" />
                          Add
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Expandable details section */}
              <button
                onClick={() => setExpandedSupplement(
                  expandedSupplement === supplement.id ? null : supplement.id
                )}
                className="flex w-full items-center justify-center gap-1 border-t border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] px-3 py-1.5 text-xs text-text-light"
              >
                {expandedSupplement === supplement.id ? (
                  <>
                    Hide Details <ChevronUp className="h-3 w-3" />
                  </>
                ) : (
                  <>
                    View Details <ChevronDown className="h-3 w-3" />
                  </>
                )}
              </button>
              
              {expandedSupplement === supplement.id && (
                <div className="border-t border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-3">
                  <p className="mb-2 text-xs text-text-light">
                    {supplement.description}
                  </p>

                  <div className="mb-2 flex flex-wrap gap-1">
                    {supplement.benefits?.map((benefit: string, index: number) => (
                      <span
                        key={index}
                        className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!showAllSupplements && supplements.length > 2 && (
        <button
          onClick={() => setShowAllSupplements(true)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-3 text-sm text-text-light transition-colors hover:bg-[hsl(var(--color-card-hover))] hover:text-text sm:hidden"
        >
          <Plus className="h-4 w-4" />
          Show {supplements.length - 2} More Supplements
        </button>
      )}

      <div className="mt-4 flex items-center justify-between rounded-lg bg-warning/5 p-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-warning" />
          <p className="text-sm text-warning">
            Low Vitamin D detected. Consider supplementation.
          </p>
        </div>
        <button
          onClick={() => navigate('/supplements')}
          className="ml-4 flex items-center gap-2 rounded-lg bg-warning/10 px-3 py-1.5 text-xs font-medium text-warning"
        >
          Learn More
        </button>
      </div>
    </div>
  );
};

export default SupplementRecommendations;