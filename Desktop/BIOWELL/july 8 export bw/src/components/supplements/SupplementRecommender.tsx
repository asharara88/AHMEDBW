import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader, Check, AlertCircle, Brain, Heart, Moon, Activity, Zap, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supplementApi } from '../../api/supplementApi';
import ApiErrorDisplay from '../common/ApiErrorDisplay';
import { useApi } from '../../hooks/useApi';
import ReactMarkdown from 'react-markdown';

interface SupplementRecommenderProps {
  onRecommendationsReceived?: (recommendations: string) => void;
}

const SupplementRecommender = ({ onRecommendationsReceived }: SupplementRecommenderProps) => {
  const [goal, setGoal] = useState('');
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [recentQueries, setRecentQueries] = useState<{goal: string, timestamp: Date}[]>([]);
  const { user } = useAuth();
  
  const { loading, error, execute: getRecommendations } = useApi(
    supplementApi.getRecommendations,
    {
      onSuccess: (response) => {
        setRecommendations(response);
        if (onRecommendationsReceived) {
          onRecommendationsReceived(response);
        }
        
        // Add to recent queries
        setRecentQueries(prev => [
          { goal, timestamp: new Date() },
          ...prev.slice(0, 4) // Keep only the 5 most recent
        ]);
      },
      errorMessage: 'Failed to get recommendations'
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;
    
    await getRecommendations(goal, user?.id);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setGoal(suggestion);
  };

  const suggestions = [
    { text: "Improve sleep quality", icon: <Moon className="h-4 w-4" /> },
    { text: "Increase energy levels", icon: <Zap className="h-4 w-4" /> },
    { text: "Reduce stress and anxiety", icon: <Brain className="h-4 w-4" /> },
    { text: "Support immune function", icon: <Shield className="h-4 w-4" /> },
    { text: "Enhance cognitive performance", icon: <Brain className="h-4 w-4" /> },
    { text: "Optimize metabolic health", icon: <Activity className="h-4 w-4" /> },
    { text: "Support joint health", icon: <Activity className="h-4 w-4" /> },
    { text: "Improve athletic recovery", icon: <Zap className="h-4 w-4" /> },
    { text: "Balance hormones naturally", icon: <Heart className="h-4 w-4" /> },
    { text: "Support heart health", icon: <Heart className="h-4 w-4" /> }
  ];

  return (
    <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-6 overflow-hidden max-w-full">
      <h2 className="mb-4 text-xl font-bold">Get Personalized Supplement Recommendations</h2>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label htmlFor="goal" className="mb-2 block text-sm font-medium">
            What's your health goal?
          </label>
          <input
            id="goal"
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g., improve sleep quality, increase energy, reduce stress"
            className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-4 py-2 text-text placeholder:text-text-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            required
          />
        </div>
        
        <div className="mb-4">
          <p className="mb-2 text-sm font-medium">Popular goals:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 5).map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion.text)}
                className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs text-primary hover:bg-primary/20"
              >
                {suggestion.icon}
                {suggestion.text}
              </button>
            ))}
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading || !goal.trim()}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50 w-full"
        >
          {loading ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              Generating recommendations...
            </>
          ) : (
            'Get Recommendations'
          )}
        </button>
      </form>
      
      {error && <ApiErrorDisplay error={error} className="mb-4" />}
      
      {recommendations && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-4 overflow-x-auto mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Check className="h-5 w-5 text-success" />
            <h3 className="text-lg font-medium">Your Personalized Recommendations</h3>
          </div>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>{recommendations}</ReactMarkdown>
          </div>
        </motion.div>
      )}
      
      {recentQueries.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-sm text-primary hover:underline"
            aria-expanded={showHistory}
            aria-controls="recent-queries"
          >
            {showHistory ? 'Hide recent queries' : 'Show recent queries'}
          </button>
          
          {showHistory && (
            <motion.div
              id="recent-queries"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-2 space-y-2 overflow-hidden"
            >
              {recentQueries.map((query, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3"
                >
                  <button
                    onClick={() => handleSuggestionClick(query.goal)}
                    className="text-sm hover:text-primary text-left"
                  >
                    {query.goal}
                  </button>
                  <span className="text-xs text-text-light">
                    {query.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      )}
      
      <div className="mt-6 flex items-center gap-2 rounded-lg bg-[hsl(var(--color-surface-2))] p-3 text-sm text-text-light">
        <AlertCircle className="h-5 w-5 text-primary" />
        <p>
          Recommendations are based on scientific research and tailored to your specific goals. Always consult with a healthcare professional before starting any new supplement regimen.
        </p>
      </div>
    </div>
  );
};

export default SupplementRecommender;