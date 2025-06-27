import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Package, Brain, Beaker } from 'lucide-react';
import { useAuthStore, useSupplementStore } from '../../store';
import { CartProvider } from '../../components/shopping/CartProvider';
import CartWidget from '../../components/shopping/CartWidget';
import ShoppingCart from '../../components/shopping/ShoppingCart';
import SupplementGrid from '../../components/supplements/SupplementGrid';
import SupplementFilters from '../../components/supplements/SupplementFilters';
import SupplementCategories from '../../components/supplements/SupplementCategories';
import SupplementFeatured from '../../components/supplements/SupplementFeatured';
import StackBuilder from '../../components/supplements/StackBuilder';
import SupplementRecommender from '../../components/supplements/SupplementRecommender';

const SupplementsPage = () => {
  const { user } = useAuthStore();
  const { supplements, userSupplements, loading, fetchSupplements, fetchUserSupplements, toggleSubscription } = useSupplementStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [evidenceFilter, setEvidenceFilter] = useState<'all' | 'green' | 'yellow'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    fetchSupplements();
    if (user) {
      fetchUserSupplements(user.id);
    }
  }, [user]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, evidenceFilter]);

  // Extract unique categories from supplements
  const categories = Array.from(
    new Set(supplements.flatMap(s => s.categories || []))
  ).sort();

  // Filter supplements based on search, category, and evidence level
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

  // Pagination
  const totalPages = Math.ceil(filteredSupplements.length / ITEMS_PER_PAGE);
  const paginatedSupplements = filteredSupplements.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );

  // Get recommended supplements (those with Green evidence level)
  const recommendedSupplements = supplements
    .filter(s => s.evidence_level === 'Green')
    .sort(() => 0.5 - Math.random()) // Shuffle
    .slice(0, 3);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setEvidenceFilter('all');
  };

  return (
    <CartProvider>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6">
            <h1 className="text-2xl font-bold md:text-3xl">Supplements</h1>
            <p className="text-text-light">
              Evidence-based supplements tailored to your health needs
            </p>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <Tabs defaultValue="browse" className="w-full">
              <TabsList>
                <TabsTrigger value="browse" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span>Browse</span>
                </TabsTrigger>
                <TabsTrigger value="stacks" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  <span>My Stacks</span>
                </TabsTrigger>
                <TabsTrigger value="recommend" className="flex items-center gap-2">
                  <Beaker className="h-4 w-4" />
                  <span>AI Recommend</span>
                </TabsTrigger>
              </TabsList>
              
              <div className="ml-4">
                <CartWidget />
              </div>
            </Tabs>
          </div>

          <Tabs defaultValue="browse" className="w-full">
            <div className="grid gap-6 md:grid-cols-12">
              {/* Main Content */}
              <div className="md:col-span-9 overflow-x-hidden max-w-full">
                <TabsContent value="browse" className="mt-0">
                {/* Featured Supplements */}
                {recommendedSupplements.length > 0 && (
                  <SupplementFeatured
                    supplements={recommendedSupplements}
                    userSupplements={userSupplements}
                    onToggleSubscription={(supplementId) => toggleSubscription(user?.id || '', supplementId)}
                    title="Recommended for You"
                    description="Based on your health profile and goals"
                  />
                )}
                
                {/* Categories */}
                <SupplementCategories
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />
                
                {/* Filters */}
                <SupplementFilters
                  categories={categories}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  evidenceFilter={evidenceFilter}
                  setEvidenceFilter={setEvidenceFilter}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  clearFilters={clearFilters}
                />

                {/* Supplements Grid */}
                <SupplementGrid
                  supplements={paginatedSupplements}
                  userSupplements={userSupplements}
                  onToggleSubscription={(supplementId) => toggleSubscription(user?.id || '', supplementId)}
                  loading={loading && supplements.length === 0}
                  emptyMessage={
                    searchQuery || selectedCategory || evidenceFilter !== 'all'
                      ? "No supplements found matching your filters."
                      : "No supplements available at this time."
                  }
                />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center space-x-2">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p-1))} 
                      disabled={currentPage === 1}
                      className="rounded-lg border border-[hsl(var(--color-border))] px-3 py-1.5 text-sm text-text-light hover:bg-[hsl(var(--color-card-hover))] disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Previous page"
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
                        aria-label={`Page ${i+1}`}
                        aria-current={currentPage === i+1 ? 'page' : undefined}
                      >
                        {i+1}
                      </button>
                    ))}
                    
                    <button 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} 
                      disabled={currentPage === totalPages}
                      className="rounded-lg border border-[hsl(var(--color-border))] px-3 py-1.5 text-sm text-text-light hover:bg-[hsl(var(--color-card-hover))] disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Next page"
                    >
                      Next
                    </button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="stacks" className="mt-0">
                <StackBuilder 
                  supplements={supplements}
                  userSupplements={userSupplements}
                  onToggleSubscription={(supplementId) => toggleSubscription(user?.id || '', supplementId)}
                />
              <TabsContent value="recommend" className="mt-0">
                <SupplementRecommender />
              </TabsContent>
              </TabsContent>
              </div>

              {/* Sidebar */}
              <div className="md:col-span-3">
                <ShoppingCart
                  isOpen={isCartOpen}
                  onClose={() => setIsCartOpen(false)}
                />
              </div>
            </div>
          </Tabs>
        </motion.div>
      </div>
    </CartProvider>
  );
};

export default SupplementsPage;