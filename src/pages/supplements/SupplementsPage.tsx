import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSupabase } from '../../contexts/SupabaseContext';
import { useAuth } from '../../contexts/AuthContext';
import { Package, ShoppingCart, Search, Filter, Grid3X3, List } from 'lucide-react';
import SupplementList from '../../components/supplements/SupplementList';
import SupplementRecommender from '../../components/supplements/SupplementRecommender';
import StackBuilder from '../../components/supplements/StackBuilder';
import ShoppingCartSidebar from '../../components/supplements/ShoppingCartSidebar';
import { Supplement } from '../../types/supplements';

const SupplementsPage = () => {
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [userSupplements, setUserSupplements] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<{ supplement: Supplement; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'recommendations' | 'stacks'>('all');
  const [cartTotal, setCartTotal] = useState(0);
  
  const { supabase } = useSupabase();
  const { user } = useAuth();
  
  useEffect(() => {
    fetchSupplements();
    
    // Load cart from localStorage
    const savedCart = localStorage.getItem('biowell-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (err) {
        console.error('Error loading cart from localStorage:', err);
      }
    }
  }, []);
  
  useEffect(() => {
    // Calculate cart total
    const total = cartItems.reduce((sum, item) => sum + (item.supplement.price_aed * item.quantity), 0);
    setCartTotal(total);
    
    // Save cart to localStorage
    localStorage.setItem('biowell-cart', JSON.stringify(cartItems));
  }, [cartItems]);
  
  const fetchSupplements = async () => {
    try {
      setLoading(true);
      
      // Fetch supplements
      const { data: supplementsData, error: supplementsError } = await supabase
        .from('supplements')
        .select('*')
        .order('name');
      
      if (supplementsError) throw supplementsError;
      
      // Fetch user supplements
      if (user) {
        const { data: userSupplementsData, error: userSupplementsError } = await supabase
          .from('user_supplements')
          .select('supplement_id')
          .eq('user_id', user.id);
        
        if (userSupplementsError) throw userSupplementsError;
        
        setUserSupplements(userSupplementsData?.map(us => us.supplement_id) || []);
      }
      
      // If no supplements in database, use mock data
      if (!supplementsData || supplementsData.length === 0) {
        const mockSupplements = [
          {
            id: '1',
            name: 'Magnesium Glycinate',
            description: 'Supports sleep quality, muscle recovery, and stress reduction.',
            categories: ['Sleep', 'Stress', 'Recovery'],
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
            id: '2',
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
            id: '3',
            name: 'Omega-3 Fish Oil',
            description: 'High-potency EPA/DHA from sustainable sources for brain and heart health.',
            categories: ['Brain Health', 'Heart Health', 'Inflammation'],
            evidence_level: 'Green',
            use_cases: ['Cognitive function', 'Heart health', 'Joint health'],
            stack_recommendations: ['Brain Health Stack', 'Heart Health Stack'],
            dosage: '2-3g daily (1000mg EPA/DHA)',
            form: 'Softgel',
            form_type: 'softgel',
            brand: 'Nordic Naturals',
            availability: true,
            price_aed: 120,
            image_url: 'https://images.pexels.com/photos/4004626/pexels-photo-4004626.jpeg'
          },
          {
            id: '4',
            name: 'Berberine HCl',
            description: 'Powerful compound for metabolic health and glucose management.',
            categories: ['Metabolic Health', 'Blood Sugar'],
            evidence_level: 'Green',
            use_cases: ['Blood sugar control', 'Metabolic health', 'Gut health'],
            stack_recommendations: ['Metabolic Stack'],
            dosage: '500mg 2-3x daily',
            form: 'Capsule',
            form_type: 'capsule_powder',
            brand: 'Thorne Research',
            availability: true,
            price_aed: 95,
            image_url: 'https://images.pexels.com/photos/3683098/pexels-photo-3683098.jpeg'
          },
          {
            id: '5',
            name: "Lion's Mane Mushroom",
            description: 'Nootropic mushroom for cognitive enhancement and nerve health.',
            categories: ['Cognitive', 'Brain Health'],
            evidence_level: 'Yellow',
            use_cases: ['Mental clarity', 'Memory', 'Nerve health'],
            stack_recommendations: ['Cognitive Stack'],
            dosage: '1000mg 1-2x daily',
            form: 'Capsule',
            form_type: 'capsule_powder',
            brand: 'Host Defense',
            availability: true,
            price_aed: 110,
            image_url: 'https://images.pexels.com/photos/3683047/pexels-photo-3683047.jpeg'
          },
          {
            id: '6',
            name: 'Ashwagandha KSM-66',
            description: 'Premium ashwagandha extract for stress and anxiety support.',
            categories: ['Stress', 'Sleep', 'Recovery'],
            evidence_level: 'Green',
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
        ];
        
        setSupplements(mockSupplements);
      } else {
        setSupplements(supplementsData);
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
  
  const addToCart = (supplement: Supplement) => {
    const existingItem = cartItems.find(item => item.supplement.id === supplement.id);
    
    if (existingItem) {
      // Increment quantity if already in cart
      setCartItems(cartItems.map(item => 
        item.supplement.id === supplement.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      // Add new item to cart
      setCartItems([...cartItems, { supplement, quantity: 1 }]);
    }
    
    // Open cart
    setIsCartOpen(true);
  };
  
  const updateCartItemQuantity = (supplementId: string, quantity: number) => {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      setCartItems(cartItems.filter(item => item.supplement.id !== supplementId));
    } else {
      // Update quantity
      setCartItems(cartItems.map(item => 
        item.supplement.id === supplementId 
          ? { ...item, quantity } 
          : item
      ));
    }
  };
  
  const removeFromCart = (supplementId: string) => {
    setCartItems(cartItems.filter(item => item.supplement.id !== supplementId));
  };
  
  const clearCart = () => {
    setCartItems([]);
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
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] px-4 py-2 text-sm font-medium transition-colors hover:bg-[hsl(var(--color-card-hover))]"
          >
            <ShoppingCart className="h-5 w-5" />
            <span>Cart</span>
            {cartItems.length > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                {cartItems.length}
              </span>
            )}
          </button>
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
                onAddToCart={addToCart}
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
            cartItems={cartItems}
            updateQuantity={updateCartItemQuantity}
            removeItem={removeFromCart}
            clearCart={clearCart}
            total={cartTotal}
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default SupplementsPage;