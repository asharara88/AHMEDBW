import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Grid3X3, List, Package, Brain, Beaker } from 'lucide-react';
import SupplementCard from '../../components/supplements/SupplementCard';
import StackBuilder from '../../components/supplements/StackBuilder';
import SupplementRecommender from '../../components/supplements/SupplementRecommender';
import { useAuthStore, useSupplementStore } from '../../store';
import { CartProvider } from '../../components/shopping/CartProvider';
import CartWidget from '../../components/shopping/CartWidget';
import ShoppingCart from '../../components/shopping/ShoppingCart';

const SupplementsPage = () => {
  const { user } = useAuthStore();
  const { supplements, userSupplements, stacks, loading, fetchSupplements, fetchUserSupplements, fetchStacks, toggleSubscription } = useSupplementStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeView, setActiveView] = useState<'browse' | 'stacks' | 'recommend'>('browse');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [evidenceFilter, setEvidenceFilter] = useState<'all' | 'green' | 'yellow'>('all');
  
  const navigate = useNavigate();
  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    fetchSupplements();
    fetchStacks();
    if (user) {
      fetchUserSupplements(user.id);
    }
  }, [user]);

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

  const filteredStacks = stacks.filter(stack => {
    return searchQuery === '' || 
      stack.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stack.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stack.category.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Pagination logic
  const pageSupplements = filteredSupplements.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );

  // Calculate total pages based on filtered items
  const totalPages = Math.ceil(filteredSupplements.length / ITEMS_PER_PAGE);

  // Extract unique categories from supplements
  const categories = Array.from(
    new Set(supplements.flatMap(s => s.categories || []))
  ).sort();

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <CartProvider>
      <div className="container mx-auto overflow-x-hidden max-w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold md:text-3xl">Supplement Store</h1>
          <p className="text-text-light">Evidence-based supplements tailored to your health needs</p>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-light" />
            <input
              type="text"
              placeholder="Search supplements..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] pl-10 pr-4 py-2 text-text placeholder:text-text-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveView('browse')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
                activeView === 'browse' 
                  ? 'bg-primary text-white' 
                  : 'bg-[hsl(var(--color-card))] text-text-light hover:bg-[hsl(var(--color-card-hover))]'
              }`}
            >
              <Package className="h-4 w-4" />
              Browse
            </button>
            <button
              onClick={() => setActiveView('stacks')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
                activeView === 'stacks' 
                  ? 'bg-primary text-white' 
                  : 'bg-[hsl(var(--color-card))] text-text-light hover:bg-[hsl(var(--color-card-hover))]'
              }`}
            >
              <Brain className="h-4 w-4" />
              My Stacks
            </button>
            <button
              onClick={() => setActiveView('recommend')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
                activeView === 'recommend' 
                  ? 'bg-primary text-white' 
                  : 'bg-[hsl(var(--color-card))] text-text-light hover:bg-[hsl(var(--color-card-hover))]'
              }`}
            >
              <Beaker className="h-4 w-4" />
              AI Recommend
            </button>
            
            <CartWidget />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-12">
          {/* Main Content */}
          <div className="md:col-span-9 overflow-x-hidden max-w-full">
            {activeView === 'browse' ? (
              <>
                <div className="mb-4 flex flex-wrap gap-2 sm:items-center sm:justify-between">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                        !selectedCategory
                          ? 'bg-primary text-white'
                          : 'bg-[hsl(var(--color-card))] text-text-light hover:bg-[hsl(var(--color-card-hover))]'
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.slice(0, 5).map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                          selectedCategory === category
                            ? 'bg-primary text-white'
                            : 'bg-[hsl(var(--color-card))] text-text-light hover:bg-[hsl(var(--color-card-hover))]'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                    {categories.length > 5 && (
                      <div className="relative">
                        <button
                          className="rounded-lg bg-[hsl(var(--color-card))] px-3 py-1.5 text-xs font-medium text-text-light hover:bg-[hsl(var(--color-card-hover))]"
                          onClick={() => document.getElementById('more-categories')?.classList.toggle('hidden')}
                        >
                          More...
                        </button>
                        <div id="more-categories" className="absolute left-0 mt-1 hidden w-48 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-2 shadow-lg z-10">
                          {categories.slice(5).map((category) => (
                            <button
                              key={category}
                              onClick={() => {
                                setSelectedCategory(category);
                                document.getElementById('more-categories')?.classList.add('hidden');
                              }}
                              className="block w-full rounded-lg px-3 py-1.5 text-left text-xs text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
                            >
                              {category}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
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
                        onClick={() => document.getElementById('evidence-filter')?.classList.toggle('hidden')}
                      >
                        <Filter className="h-4 w-4" />
                        Evidence
                      </button>
                      
                      <div id="evidence-filter" className="absolute right-0 mt-1 hidden w-48 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-2 shadow-lg z-10">
                        <div className="space-y-1">
                          <button
                            onClick={() => {
                              setEvidenceFilter('all');
                              document.getElementById('evidence-filter')?.classList.add('hidden');
                            }}
                            className={`block w-full rounded-lg px-3 py-1.5 text-left text-xs ${
                              evidenceFilter === 'all'
                                ? 'bg-primary/10 text-primary'
                                : 'text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text'
                            }`}
                          >
                            All Evidence Levels
                          </button>
                          <button
                            onClick={() => {
                              setEvidenceFilter('green');
                              document.getElementById('evidence-filter')?.classList.add('hidden');
                            }}
                            className={`block w-full rounded-lg px-3 py-1.5 text-left text-xs ${
                              evidenceFilter === 'green'
                                ? 'bg-success/10 text-success'
                                : 'text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text'
                            }`}
                          >
                            Green Tier Only
                          </button>
                          <button
                            onClick={() => {
                              setEvidenceFilter('yellow');
                              document.getElementById('evidence-filter')?.classList.add('hidden');
                            }}
                            className={`block w-full rounded-lg px-3 py-1.5 text-left text-xs ${
                              evidenceFilter === 'yellow'
                                ? 'bg-warning/10 text-warning'
                                : 'text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text'
                            }`}
                          >
                            Yellow Tier Only
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Supplements Section */}
                {viewMode === 'grid' ? (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {pageSupplements.map((supplement) => (
                      <SupplementCard
                        key={supplement.id}
                        supplement={supplement}
                        isInStack={userSupplements.includes(supplement.id)}
                        onAddToStack={() => toggleSubscription(user?.id || '', supplement.id)}
                        onRemoveFromStack={() => toggleSubscription(user?.id || '', supplement.id)}
                        onViewDetails={() => {
                          // Implement detailed view if needed
                          console.log('View details for', supplement.name);
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pageSupplements.map((supplement) => (
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
                                onClick={() => toggleSubscription(user?.id || '', supplement.id)}
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

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 mt-6">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p-1))} 
                      disabled={currentPage === 1}
                      className="rounded-lg border border-[hsl(var(--color-border))] px-3 py-1.5 text-sm text-text-light hover:bg-[hsl(var(--color-card-hover))] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button 
                        key={i+1} 
                        onClick={() => setCurrentPage(i+1)}
                        className={`rounded-lg px-3 py-1.5 text-sm ${
                          currentPage === i+1 
                            ? 'bg-primary text-white' 
                            : 'border border-[hsl(var(--color-border))] text-text-light hover:bg-[hsl(var(--color-card-hover))]'
                        }`}
                      >
                        {i+1}
                      </button>
                    ))}
                    
                    <button 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} 
                      disabled={currentPage === totalPages}
                      className="rounded-lg border border-[hsl(var(--color-border))] px-3 py-1.5 text-sm text-text-light hover:bg-[hsl(var(--color-card-hover))] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}

                {/* No Results Message */}
                {filteredSupplements.length === 0 && (
                  <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-8 text-center">
                    <p className="text-text-light">No supplements found matching your search criteria.</p>
                  </div>
                )}
              </>
            ) : activeView === 'stacks' ? (
              <div className="overflow-x-hidden max-w-full">
                <StackBuilder 
                  supplements={supplements}
                  userSupplements={userSupplements}
                  onToggleSubscription={(supplementId) => toggleSubscription(user?.id || '', supplementId)}
                />
              </div>
            ) : activeView === 'recommend' && (
              <div className="overflow-x-hidden max-w-full">
                <SupplementRecommender />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="md:col-span-3">
            <ShoppingCart
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(false)}
            />
          </div>
        </div>
      </div>
    </CartProvider>
  );
};

export default SupplementsPage;