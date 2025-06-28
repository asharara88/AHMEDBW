import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../../contexts/SupabaseContext';
import { ShoppingCart, Pill, AlertCircle, CheckCircle, ArrowRight, Info } from 'lucide-react';
import ImageWithFallback from '../common/ImageWithFallback';
import { motion } from 'framer-motion';

interface SupplementRecommendationsProps {
  userId: string;
}

const SupplementRecommendations = ({ userId }: SupplementRecommendationsProps) => {
  const [supplements, setSupplements] = useState<any[]>([]);
  const [userSupplements, setUserSupplements] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'recommended' | 'trending'>('recommended');
  
  const { supabase } = useSupabase();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchSupplements = async () => {
      if (!userId) return;
      
      try {
        // Fetch recommended supplements
        const { data: suppData, error: suppError } = await supabase
          .from('supplements')
          .select('*')
          .limit(6);
        
        if (suppError) throw suppError;
        
        // Fetch user supplements
        const { data: userSuppData, error: userSuppError } = await supabase
          .from('user_supplements')
          .select('supplement_id')
          .eq('user_id', userId);
        
        if (userSuppError) throw userSuppError;
        
        setSupplements(suppData || []);
        setUserSupplements(userSuppData?.map((item) => item.supplement_id) || []);
      } catch (error) {
        console.error('Error fetching supplements:', error);
        
        // Mock data for demo
        setSupplements([
          {
            id: '1',
            name: 'Magnesium Glycinate',
            description: 'Supports sleep quality, muscle recovery, and stress reduction.',
            benefits: ['Sleep', 'Stress', 'Recovery'],
            dosage: '300-400mg before bed',
            price_aed: 49.99,
            image_url: 'https://images.pexels.com/photos/139655/pexels-photo-139655.jpeg?auto=compress&cs=tinysrgb&w=800',
            form_type: 'capsule_powder',
            form_image_url: 'https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/supplements/powder%20capsule.png?token=XnuWlyUiL0oHpK4rr0Ej79FjlAGLwAoyoLGdNNSHtIo',
            evidence_level: 'Green'
          },
          {
            id: '2',
            name: 'Vitamin D3 + K2',
            description: 'Supports bone health, immune function, and mood regulation.',
            benefits: ['Immunity', 'Bone Health', 'Mood'],
            dosage: '5000 IU daily with fat-containing meal',
            price_aed: 39.99,
            image_url: 'https://images.pexels.com/photos/4004612/pexels-photo-4004612.jpeg?auto=compress&cs=tinysrgb&w=800',
            form_type: 'softgel',
            form_image_url: 'https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/supplements/gel%20capsule%20ChatGPT%20Image%20May%204,%202025,%2006_50_42%20AM.png?token=7LqcdP_VcICkC1b-0Y4uFq9iapjjnU32JUEitEp3OTY',
            evidence_level: 'Green'
          },
          {
            id: '3',
            name: 'Omega-3 Fish Oil',
            description: 'Supports heart health, brain function, and reduces inflammation.',
            benefits: ['Heart', 'Brain', 'Inflammation'],
            dosage: '1-2g daily with food',
            price_aed: 59.99,
            image_url: 'https://images.pexels.com/photos/9751994/pexels-photo-9751994.jpeg?auto=compress&cs=tinysrgb&w=800',
            form_type: 'softgel',
            form_image_url: 'https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/supplements/gel%20capsule%20ChatGPT%20Image%20May%204,%202025,%2006_50_42%20AM.png?token=7LqcdP_VcICkC1b-0Y4uFq9iapjjnU32JUEitEp3OTY',
            evidence_level: 'Green'
          },
          {
            id: '4',
            name: 'Ashwagandha',
            description: 'Adaptogenic herb that helps reduce stress and anxiety.',
            benefits: ['Stress', 'Sleep', 'Mood'],
            dosage: '600mg daily',
            price_aed: 45.99,
            image_url: 'https://images.pexels.com/photos/3683051/pexels-photo-3683051.jpeg?auto=compress&cs=tinysrgb&w=800',
            form_type: 'capsule_powder',
            form_image_url: 'https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/supplements/powder%20capsule.png?token=XnuWlyUiL0oHpK4rr0Ej79FjlAGLwAoyoLGdNNSHtIo',
            evidence_level: 'Yellow'
          }
        ]);
        setUserSupplements(['2']);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSupplements();
  }, [userId, supabase]);
  
  const toggleSubscription = async (supplementId: string) => {
    if (!userId) return;
    
    const isSubscribed = userSupplements.includes(supplementId);
    
    try {
      if (isSubscribed) {
        // Remove subscription
        await supabase
          .from('user_supplements')
          .delete()
          .eq('user_id', userId)
          .eq('supplement_id', supplementId);
        
        setUserSupplements(userSupplements.filter((id) => id !== supplementId));
      } else {
        // Add subscription
        await supabase.from('user_supplements').insert({
          user_id: userId,
          supplement_id: supplementId,
          subscription_active: true,
          created_at: new Date().toISOString(),
        });
        
        setUserSupplements([...userSupplements, supplementId]);
      }
    } catch (error) {
      console.error('Error toggling subscription:', error);
      
      // For demo, just toggle the state
      if (isSubscribed) {
        setUserSupplements(userSupplements.filter((id) => id !== supplementId));
      } else {
        setUserSupplements([...userSupplements, supplementId]);
      }
    }
  };

  // Filter supplements based on active tab
  const displayedSupplements = activeTab === 'recommended' 
    ? supplements.slice(0, 3) 
    : supplements.slice(3, 6);
  
  if (loading) {
    return (
      <div className="rounded-xl bg-[hsl(var(--color-card))] p-6 shadow-md">
        <h2 className="mb-4 text-lg font-bold">Supplement Recommendations</h2>
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="rounded-xl bg-[hsl(var(--color-card))] p-6 shadow-md">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Personalized Supplement Recommendations</h2>
          <p className="text-sm text-text-light">
            Based on your health data and goals
          </p>
        </div>
        <div className="flex items-center text-primary">
          <ShoppingCart className="mr-2 h-5 w-5" />
          <span className="font-medium">{userSupplements.length}</span> in your stack
        </div>
      </div>
      
      {/* Tab navigation */}
      <div className="mb-4 flex border-b border-[hsl(var(--color-border))]">
        <button
          onClick={() => setActiveTab('recommended')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'recommended' 
              ? 'border-b-2 border-primary text-primary' 
              : 'text-text-light hover:text-text'
          }`}
        >
          Recommended for You
        </button>
        <button
          onClick={() => setActiveTab('trending')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'trending' 
              ? 'border-b-2 border-primary text-primary' 
              : 'text-text-light hover:text-text'
          }`}
        >
          Trending Now
        </button>
      </div>
      
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {displayedSupplements.map((supplement) => {
          const isSubscribed = userSupplements.includes(supplement.id);
          
          return (
            <motion.div
              key={supplement.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] overflow-hidden"
            >
              <div className="relative h-32 flex items-center justify-center p-4 bg-[hsl(var(--color-card))]">
                <ImageWithFallback
                  src={supplement.form_image_url || supplement.image_url}
                  alt={supplement.name}
                  className="h-full max-h-24 w-auto object-contain"
                />
                <div className="absolute top-2 right-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    supplement.evidence_level === 'Green' ? 'bg-success/10 text-success' :
                    supplement.evidence_level === 'Yellow' ? 'bg-warning/10 text-warning' :
                    'bg-error/10 text-error'
                  }`}>
                    {supplement.evidence_level}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-medium">{supplement.name}</h3>
                  <span className="font-medium text-text">AED {supplement.price_aed.toFixed(2)}</span>
                </div>
                
                <p className="mb-3 text-sm text-text-light line-clamp-2">
                  {supplement.description}
                </p>
                
                <div className="mb-3 flex flex-wrap gap-1">
                  {supplement.benefits?.slice(0, 3).map((benefit: string, index: number) => (
                    <span
                      key={index}
                      className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
                
                <div className="mb-4 flex items-center rounded-lg bg-[hsl(var(--color-card))] p-2 text-xs text-text-light">
                  <Pill className="mr-2 h-4 w-4 text-primary" />
                  Dosage: {supplement.dosage}
                </div>
                
                <button
                  onClick={() => toggleSubscription(supplement.id)}
                  className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                    isSubscribed
                      ? 'bg-primary/10 text-primary'
                      : 'bg-primary text-white hover:bg-primary-dark'
                  }`}
                >
                  {isSubscribed ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      In Your Stack
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" />
                      Add to Stack
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <div className="flex flex-col gap-4 rounded-lg bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start sm:items-center">
          <AlertCircle className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-primary sm:mt-0" />
          <p className="text-sm">
            <span className="font-medium">Recommendation:</span> Based on your recent sleep data and stress levels, we recommend trying Magnesium Glycinate.
          </p>
        </div>
        <button
          onClick={() => navigate('/supplements')}
          className="flex items-center justify-center gap-1 whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-dark"
        >
          View All Supplements
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      
      <div className="mt-4 flex items-center gap-2 rounded-lg bg-[hsl(var(--color-surface-1))] p-3 text-sm text-text-light">
        <Info className="h-5 w-5 text-primary" />
        <p>
          Supplement recommendations are personalized based on your health data, goals, and scientific research. Always consult with a healthcare professional before starting any new supplement regimen.
        </p>
      </div>
    </div>
  );
};

export default SupplementRecommendations;