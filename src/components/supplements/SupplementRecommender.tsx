import { useState } from 'react';
import { Loader, Check, AlertCircle } from 'lucide-react';
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
    "Improve sleep quality",
    "Increase energy levels",
    "Reduce stress and anxiety",
    "Support immune function",
    "Enhance cognitive performance",
    "Optimize metabolic health",
    "Support joint health",
    "Improve athletic recovery",
    "Balance hormones naturally",
    "Support heart health"
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
            className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-4 py-2 text-text placeholder:text-text-light"
            required
          />
        </div>
        
        <div className="mb-4">
          <p className="mb-2 text-sm font-medium">Popular goals:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 5).map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary hover:bg-primary/20"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading || !goal.trim()}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
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
        <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-4 overflow-x-auto">
          <div className="flex items-center gap-2 mb-3">
            <Check className="h-5 w-5 text-success" />
            <h3 className="text-lg font-medium">Your Personalized Recommendations</h3>
          </div>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>{recommendations}</ReactMarkdown>
          </div>
        </div>
      )}
      
      {recentQueries.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            {showHistory ? 'Hide recent queries' : 'Show recent queries'}
          </button>
          
          {showHistory && (
            <div className="mt-2 space-y-2">
              {recentQueries.map((query, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3"
                >
                  <button
                    onClick={() => handleSuggestionClick(query.goal)}
                    className="text-sm hover:text-primary"
                  >
                    {query.goal}
                  </button>
                  <span className="text-xs text-text-light">
                    {query.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              ))}
            </div>
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