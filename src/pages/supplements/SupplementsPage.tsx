import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
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
  
  const navigate = useNavigate();
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchSupplements();
    fetchStacks();
    if (user) {
      fetchUserSupplements(user.id);
    }
  }, [user]);

  const filteredSupplements = supplements.filter(supplement => {
    return searchQuery === '' || 
      supplement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplement.description.toLowerCase().includes(searchQuery.toLowerCase());
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

  const pageStacks = filteredStacks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );

  // Calculate total pages based on combined items
  const totalItems = filteredSupplements.length + filteredStacks.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

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
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                activeView === 'browse' 
                  ? 'bg-primary text-white' 
                  : 'bg-[hsl(var(--color-card))] text-text-light hover:bg-[hsl(var(--color-card-hover))]'
              }`}
            >
              Browse
            </button>
            <button
              onClick={() => setActiveView('stacks')}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                activeView === 'stacks' 
                  ? 'bg-primary text-white' 
                  : 'bg-[hsl(var(--color-card))] text-text-light hover:bg-[hsl(var(--color-card-hover))]'
              }`}
            >
              My Stacks
            </button>
            <button
              onClick={() => setActiveView('recommend')}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                activeView === 'recommend' 
                  ? 'bg-primary text-white' 
                  : 'bg-[hsl(var(--color-card))] text-text-light hover:bg-[hsl(var(--color-card-hover))]'
              }`}
            >
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
                {/* Supplements Section */}
                {pageSupplements.length > 0 && (
                  <div className="mb-8 overflow-x-hidden max-w-full">
                    <h2 className="mb-4 text-xl font-bold">Supplements</h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {pageSupplements.map((supplement) => (
                        <SupplementCard
                          key={supplement.id}
                          supplement={supplement}
                          isInStack={userSupplements.includes(supplement.id)}
                          onAddToStack={() => toggleSubscription(user?.id || '', supplement.id)}
                          onRemoveFromStack={() => toggleSubscription(user?.id || '', supplement.id)}
                          onAddToCart={() => useCartStore.getState().addItem(supplement)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Stacks Section */}
                {pageStacks.length > 0 && (
                  <div className="mb-8 overflow-x-hidden max-w-full">
                    <h2 className="mb-4 text-xl font-bold">Supplement Stacks</h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {pageStacks.map((stack) => (
                        <motion.div
                          key={stack.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex flex-col rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4"
                        >
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold">{stack.name}</h3>
                            <p className="mb-3 text-sm text-text-light">{stack.description}</p>
                            
                            <div className="mb-3 flex flex-wrap gap-1">
                              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                {stack.category}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-auto flex items-center justify-between">
                            <span className="font-bold">AED {stack.total_price.toFixed(2)}</span>
                            <button
                              className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-dark"
                            >
                              View Stack
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 mt-4 mb-8">
                    <button 
                      onClick={() => setCurrentPage(p => p-1)} 
                      disabled={currentPage === 1}
                      className="px-3 py-1 rounded-md hover:bg-[hsl(var(--color-card-hover))] dark:hover:bg-[hsl(var(--color-card-hover))] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button 
                        key={i+1} 
                        onClick={() => setCurrentPage(i+1)}
                        className={`px-3 py-1 rounded-md hover:bg-[hsl(var(--color-card-hover))] dark:hover:bg-[hsl(var(--color-card-hover))] ${
                          currentPage === i+1 ? 'font-bold underline text-primary' : ''
                        }`}
                      >
                        {i+1}
                      </button>
                    ))}
                    
                    <button 
                      onClick={() => setCurrentPage(p => p+1)} 
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 rounded-md hover:bg-[hsl(var(--color-card-hover))] dark:hover:bg-[hsl(var(--color-card-hover))] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}

                {/* No Results Message */}
                {filteredSupplements.length === 0 && filteredStacks.length === 0 && (
                  <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-8 text-center">
                    <p className="text-text-light">No supplements or stacks found matching your search criteria.</p>
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