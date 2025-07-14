import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Package, Brain, Beaker, Filter, ShoppingBag, Star, Award, Tag, Zap } from 'lucide-react';
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
import ErrorBoundary from '../../components/common/ErrorBoundary';
import SupplementCompare from '../../components/supplements/SupplementCompare';
import SubscriptionOptions from '../../components/supplements/SubscriptionOptions';
import SupplementReviews from '../../components/supplements/SupplementReviews';

const SupplementsPage = () => {
  const { user } = useAuthStore();
  const { supplements, userSupplements, loading, fetchSupplements, fetchUserSupplements, toggleSubscription } = useSupplementStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [evidenceFilter, setEvidenceFilter] = useState<'all' | 'green' | 'yellow'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [sortOption, setSortOption] = useState('featured');
  const [compareItems, setCompareItems] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  
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
  }, [searchQuery, selectedCategory, evidenceFilter, priceRange, sortOption]);

  // Extract unique categories from supplements
  const categories = Array.from(
    new Set(supplements.flatMap(s => s.categories || []))
  ).sort();

  // Filter supplements based on search, category, evidence level, and price
  const filteredSupplements = supplements.filter(supplement => {
    const matchesSearch = searchQuery === '' || 
      supplement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (supplement.description && supplement.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !selectedCategory || 
      (supplement.categories && supplement.categories.includes(selectedCategory));
    
    const matchesEvidence = evidenceFilter === 'all' || 
      (evidenceFilter === 'green' && supplement.evidence_level === 'Green') ||
      (evidenceFilter === 'yellow' && supplement.evidence_level === 'Yellow');
    
    const matchesPrice = 
      (supplement.price_aed || 0) >= priceRange[0] && 
      (supplement.price_aed || 0) <= priceRange[1];
    
    return matchesSearch && matchesCategory && matchesEvidence && matchesPrice;
  });

  // Sort supplements
  const sortedSupplements = [...filteredSupplements].sort((a, b) => {
    switch (sortOption) {
      case 'price-asc':
        return (a.price_aed || 0) - (b.price_aed || 0);
      case 'price-desc':
        return (b.price_aed || 0) - (a.price_aed || 0);
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'evidence':
        // Sort by evidence level: Green > Yellow > Red > undefined
        const evidenceOrder = { 'Green': 0, 'Yellow': 1, 'Red': 2, undefined: 3 };
        return (evidenceOrder[a.evidence_level as keyof typeof evidenceOrder] || 3) - 
               (evidenceOrder[b.evidence_level as keyof typeof evidenceOrder] || 3);
      case 'featured':
      default:
        // Featured items first, then bestsellers, then the rest
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        if (a.is_bestseller && !b.is_bestseller) return -1;
        if (!a.is_bestseller && b.is_bestseller) return 1;
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedSupplements.length / ITEMS_PER_PAGE);
  const paginatedSupplements = sortedSupplements.slice(
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
    setPriceRange([0, 500]);
    setSortOption('featured');
  };

  // Toggle compare item
  const toggleCompareItem = (supplementId: string) => {
    setCompareItems(prev => {
      if (prev.includes(supplementId)) {
        return prev.filter(id => id !== supplementId);
      } else {
        if (prev.length >= 3) {
          // Limit to 3 items for comparison
          return [...prev.slice(1), supplementId];
        }
        return [...prev, supplementId];
      }
    });
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
            <div className="flex items-center gap-4 w-full">
              <Tabs defaultValue="browse" onValueChange={setActiveTab} className="flex-1">
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
                  <TabsTrigger value="compare" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Compare</span>
                    {compareItems.length > 0 && (
                      <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                        {compareItems.length}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>

                <div className="grid gap-6 md:grid-cols-12 mt-6">
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
                        priceRange={priceRange}
                        setPriceRange={setPriceRange}
                        sortOption={sortOption}
                        setSortOption={setSortOption}
                      />

                      {/* Subscription Options */}
                      <SubscriptionOptions />

                      {/* Supplements Grid */}
                      <SupplementGrid
                        supplements={paginatedSupplements}
                        userSupplements={userSupplements}
                        onToggleSubscription={(supplementId) => toggleSubscription(user?.id || '', supplementId)}
                        onToggleCompare={toggleCompareItem}
                        compareItems={compareItems}
                        loading={loading && supplements.length === 0}
                        emptyMessage={
                          searchQuery || selectedCategory || evidenceFilter !== 'all' || priceRange[0] > 0 || priceRange[1] < 500
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

                      {/* Reviews Section */}
                      <div className="mt-12">
                        <SupplementReviews />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="stacks" className="mt-0">
                      <ErrorBoundary>
                        <StackBuilder
                          supplements={supplements}
                          userSupplements={userSupplements}
                          onToggleSubscription={(supplementId) =>
                            toggleSubscription(user?.id || '', supplementId)}
                        />
                      </ErrorBoundary>
                    </TabsContent>
                    
                    <TabsContent value="recommend" className="mt-0">
                      <SupplementRecommender />
                    </TabsContent>

                    <TabsContent value="compare" className="mt-0">
                      <SupplementCompare 
                        supplements={supplements}
                        compareItems={compareItems}
                        onRemoveItem={(id) => setCompareItems(prev => prev.filter(item => item !== id))}
                        onClearAll={() => setCompareItems([])}
                      />
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
              
              <div className="ml-4">
                <CartWidget />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </CartProvider>
  );
};

export default SupplementsPage;