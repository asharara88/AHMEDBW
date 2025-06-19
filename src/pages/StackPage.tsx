import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Package, Check, Info, ShoppingCart, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuthStore, useSupplementStore } from '../store';
import { useCartStore } from '../store/useCartStore';
import ImageWithFallback from '../components/common/ImageWithFallback';
import { Supplement } from '../types/supplements';

const StackPage = () => {
  const [loading, setLoading] = useState(true);
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [stackName, setStackName] = useState('Your Personalized Stack');
  const [stackDescription, setStackDescription] = useState('Based on your health assessment');
  
  const { user } = useAuthStore();
  const { fetchSupplements } = useSupplementStore();
  const { addItem } = useCartStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get query parameters
  const queryParams = new URLSearchParams(location.search);
  const goal = queryParams.get('goal');
  
  useEffect(() => {
    const loadSupplements = async () => {
      setLoading(true);
      try {
        // In a real app, you would fetch personalized recommendations
        // based on the user's quiz answers
        const allSupplements = await fetchSupplements();
        
        // For demo purposes, select supplements based on the goal
        let selectedSupplements: Supplement[] = [];
        let stackTitle = 'Your Personalized Stack';
        let stackDesc = 'Based on your health assessment';
        
        if (goal === 'Improve Sleep') {
          selectedSupplements = allSupplements.filter(s => 
            s.categories?.includes('Sleep') || 
            s.name.includes('Magnesium') || 
            s.name.includes('Ashwagandha')
          ).slice(0, 3);
          stackTitle = 'Sleep Optimization Stack';
          stackDesc = 'Supplements to improve sleep quality and recovery';
        } else if (goal === 'Increase Energy') {
          selectedSupplements = allSupplements.filter(s => 
            s.categories?.includes('Energy') || 
            s.name.includes('B') || 
            s.name.includes('CoQ10')
          ).slice(0, 3);
          stackTitle = 'Energy Enhancement Stack';
          stackDesc = 'Supplements to boost energy and reduce fatigue';
        } else if (goal === 'Build Muscle') {
          selectedSupplements = allSupplements.filter(s => 
            s.categories?.includes('Performance') || 
            s.name.includes('Protein') || 
            s.name.includes('Creatine')
          ).slice(0, 3);
          stackTitle = 'Muscle Building Stack';
          stackDesc = 'Supplements to support muscle growth and recovery';
        } else if (goal === 'Reduce Stress') {
          selectedSupplements = allSupplements.filter(s => 
            s.categories?.includes('Stress') || 
            s.name.includes('Ashwagandha') || 
            s.name.includes('Theanine')
          ).slice(0, 3);
          stackTitle = 'Stress Management Stack';
          stackDesc = 'Supplements to reduce stress and promote calm';
        } else if (goal === 'Optimize Metabolism') {
          selectedSupplements = allSupplements.filter(s => 
            s.categories?.includes('Metabolic') || 
            s.name.includes('Berberine') || 
            s.name.includes('Chromium')
          ).slice(0, 3);
          stackTitle = 'Metabolic Health Stack';
          stackDesc = 'Supplements to support metabolic health and glucose control';
        } else {
          // Default: select a few random supplements
          selectedSupplements = allSupplements.slice(0, 3);
        }
        
        // If we don't have enough supplements, add some defaults
        if (selectedSupplements.length < 3) {
          const defaults = [
            {
              id: 'magnesium-glycinate',
              name: 'Magnesium Glycinate',
              description: 'Supports sleep quality, muscle recovery, and stress reduction.',
              categories: ['Sleep', 'Recovery', 'Stress'],
              evidence_level: 'Green',
              use_cases: ['Sleep quality', 'Muscle recovery', 'Stress management'],
              stack_recommendations: ['Sleep Stack', 'Recovery Stack'],
              dosage: '300-400mg before bed',
              form: 'Capsule',
              form_type: 'capsule_powder',
              brand: 'Pure Encapsulations',
              availability: true,
              price_aed: 49.99,
              image_url: 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg',
              form_image_url: 'https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/supplements/powder%20capsule.png?token=XnuWlyUiL0oHpK4rr0Ej79FjlAGLwAoyoLGdNNSHtIo'
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
              price_aed: 39.99,
              image_url: 'https://images.pexels.com/photos/3683051/pexels-photo-3683051.jpeg',
              form_image_url: 'https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/supplements/powder%20capsule.png?token=XnuWlyUiL0oHpK4rr0Ej79FjlAGLwAoyoLGdNNSHtIo'
            },
            {
              id: 'vitamin-d3-k2',
              name: 'Vitamin D3 + K2',
              description: 'Supports bone health, immune function, and mood regulation.',
              categories: ['Immunity', 'Bone Health', 'Mood'],
              evidence_level: 'Green',
              use_cases: ['Immune support', 'Bone health', 'Cardiovascular health'],
              stack_recommendations: ['Immunity Stack', 'Bone Health Stack'],
              dosage: '5000 IU D3 / 100mcg K2',
              form: 'Softgel',
              form_type: 'softgel',
              brand: 'Thorne Research',
              availability: true,
              price_aed: 34.99,
              image_url: 'https://images.pexels.com/photos/4004612/pexels-photo-4004612.jpeg',
              form_image_url: 'https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/supplements/gel%20capsule%20ChatGPT%20Image%20May%204,%202025,%2006_50_42%20AM.png?token=7LqcdP_VcICkC1b-0Y4uFq9iapjjnU32JUEitEp3OTY'
            }
          ];
          
          // Add defaults until we have 3 supplements
          for (let i = 0; i < defaults.length && selectedSupplements.length < 3; i++) {
            if (!selectedSupplements.some(s => s.id === defaults[i].id)) {
              selectedSupplements.push(defaults[i] as Supplement);
            }
          }
        }
        
        setSupplements(selectedSupplements);
        setStackName(stackTitle);
        setStackDescription(stackDesc);
      } catch (error) {
        console.error('Error loading supplements:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSupplements();
  }, [fetchSupplements, goal]);
  
  const handleAddAllToCart = () => {
    supplements.forEach(supplement => {
      addItem(supplement);
    });
    
    // Show a notification or feedback
    alert('All supplements added to cart!');
  };
  
  const calculateTotalPrice = () => {
    return supplements.reduce((total, supplement) => total + supplement.price_aed, 0);
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-text-light hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">{stackName}</h1>
        <p className="text-text-light">{stackDescription}</p>
      </div>
      
      <div className="grid gap-8 md:grid-cols-12">
        {/* Main content */}
        <div className="md:col-span-8">
          <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Your Personalized Stack</h2>
                <p className="text-sm text-text-light">Based on your health assessment</p>
              </div>
            </div>
            
            <div className="space-y-6">
              {supplements.map((supplement) => (
                <motion.div
                  key={supplement.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] overflow-hidden sm:flex-row"
                >
                  <div className="h-40 w-full sm:h-auto sm:w-40 flex-shrink-0 overflow-hidden bg-[hsl(var(--color-card))] p-4 flex items-center justify-center">
                    <ImageWithFallback
                      src={supplement.form_image_url || supplement.image_url}
                      alt={supplement.name}
                      className="h-full max-h-32 w-auto object-contain"
                    />
                  </div>
                  
                  <div className="flex flex-1 flex-col p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{supplement.name}</h3>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            supplement.evidence_level === 'Green' ? 'bg-success/10 text-success' :
                            supplement.evidence_level === 'Yellow' ? 'bg-warning/10 text-warning' :
                            'bg-error/10 text-error'
                          }`}>
                            {supplement.evidence_level}
                          </span>
                        </div>
                        <p className="text-sm text-text-light">{supplement.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">AED {supplement.price_aed.toFixed(2)}</div>
                      </div>
                    </div>
                    
                    <div className="mb-3 flex flex-wrap gap-1">
                      {supplement.categories?.map((category, index) => (
                        <span
                          key={index}
                          className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                    
                    <div className="mb-3 rounded-lg bg-[hsl(var(--color-card))] p-3">
                      <div className="mb-1 text-xs font-medium">Recommended Usage</div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-success" />
                        <span>{supplement.dosage}</span>
                      </div>
                    </div>
                    
                    <div className="mt-auto flex justify-end">
                      <button
                        onClick={() => addItem(supplement)}
                        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="md:col-span-4">
          <div className="sticky top-24 space-y-6">
            <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-6">
              <h3 className="mb-4 text-lg font-bold">Stack Summary</h3>
              
              <div className="mb-4 space-y-3">
                {supplements.map((supplement) => (
                  <div key={supplement.id} className="flex items-center justify-between">
                    <span className="text-sm">{supplement.name}</span>
                    <span className="font-medium">AED {supplement.price_aed.toFixed(2)}</span>
                  </div>
                ))}
                
                <div className="border-t border-[hsl(var(--color-border))] pt-3">
                  <div className="flex items-center justify-between font-bold">
                    <span>Total</span>
                    <span>AED {calculateTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleAddAllToCart}
                className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-white hover:bg-primary-dark"
              >
                <ShoppingCart className="h-5 w-5" />
                Add All to Cart
              </button>
              
              <div className="flex items-start gap-2 rounded-lg bg-[hsl(var(--color-surface-1))] p-3 text-xs text-text-light">
                <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <p>
                  This stack is personalized based on your health assessment. You can modify it anytime.
                </p>
              </div>
            </div>
            
            <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-6">
              <h3 className="mb-4 text-lg font-bold">Why This Stack?</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-success/10 p-1.5 text-success">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium">Evidence-Based</h4>
                    <p className="text-sm text-text-light">All supplements are backed by scientific research</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-success/10 p-1.5 text-success">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium">Personalized</h4>
                    <p className="text-sm text-text-light">Tailored to your specific health goals and needs</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-success/10 p-1.5 text-success">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium">Synergistic</h4>
                    <p className="text-sm text-text-light">Supplements work together for optimal results</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex items-start gap-2 rounded-lg bg-warning/10 p-3 text-xs text-warning">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <p>
                  Always consult with a healthcare professional before starting any new supplement regimen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StackPage;