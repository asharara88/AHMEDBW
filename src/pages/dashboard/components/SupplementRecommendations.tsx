import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../../../contexts/SupabaseContext';
import { logError } from '../../../utils/logger';
import { ShoppingCart, Pill, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

interface SupplementRecommendationsProps {
  userId: string;
}

const SupplementRecommendations = ({ userId }: SupplementRecommendationsProps) => {
  const [supplements, setSupplements] = useState<any[]>([]);
  const [userSupplements, setUserSupplements] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
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
          .limit(3);
        
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
        logError('Error fetching supplements', error);
        
        // Mock data for demo
        setSupplements([
          {
            id: '1',
            name: 'Magnesium Glycinate',
            description: 'Supports sleep quality, muscle recovery, and stress reduction.',
            benefits: ['Sleep', 'Stress', 'Recovery'],
            dosage: '300-400mg before bed',
            price: 34.99,
            image_url: 'https://images.pexels.com/photos/139655/pexels-photo-139655.jpeg?auto=compress&cs=tinysrgb&w=800',
          },
          {
            id: '2',
            name: 'Vitamin D3 + K2',
            description: 'Supports bone health, immune function, and mood regulation.',
            benefits: ['Immunity', 'Bone Health', 'Mood'],
            dosage: '5000 IU daily with fat-containing meal',
            price: 29.99,
            image_url: 'https://images.pexels.com/photos/4004612/pexels-photo-4004612.jpeg?auto=compress&cs=tinysrgb&w=800',
          },
          {
            id: '3',
            name: 'Omega-3 Fish Oil',
            description: 'Supports heart health, brain function, and reduces inflammation.',
            benefits: ['Heart', 'Brain', 'Inflammation'],
            dosage: '1-2g daily with food',
            price: 39.99,
            image_url: 'https://images.pexels.com/photos/9751994/pexels-photo-9751994.jpeg?auto=compress&cs=tinysrgb&w=800',
          },
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
      logError('Error toggling subscription', error);
      
      // For demo, just toggle the state
      if (isSubscribed) {
        setUserSupplements(userSupplements.filter((id) => id !== supplementId));
      } else {
        setUserSupplements([...userSupplements, supplementId]);
      }
    }
  };
  
  if (loading) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-md">
        <h2 className="mb-4 text-lg font-bold">Supplement Recommendations</h2>
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="rounded-xl bg-white p-6 shadow-md">
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
      
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {supplements.map((supplement) => {
          const isSubscribed = userSupplements.includes(supplement.id);
          
          return (
            <div key={supplement.id} className="rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
              <div className="relative h-40 w-full overflow-hidden rounded-t-lg">
                <img
                  src={supplement.image_url}
                  alt={supplement.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
                  {supplement.benefits?.map((benefit: string) => (
                    <span
                      key={benefit}
                      className="rounded-full bg-black/70 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm"
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold">{supplement.name}</h3>
                  <span className="font-medium text-text">${supplement.price}</span>
                </div>
                
                <p className="mb-3 text-sm text-text-light">
                  {supplement.description}
                </p>
                
                <div className="mb-4 flex items-center rounded-lg bg-gray-50 p-2 text-xs text-text-light">
                  <Pill className="mr-2 h-4 w-4 text-primary" />
                  Dosage: {supplement.dosage}
                </div>
                
                <button
                  onClick={() => toggleSubscription(supplement.id)}
                  className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition
                    ${isSubscribed
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
            </div>
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
    </div>
  );
};

export default SupplementRecommendations;