import { useState } from 'react';
import { Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supplementApi } from '../../api/supplementApi';
import ApiErrorDisplay from '../common/ApiErrorDisplay';
import { useApi } from '../../hooks/useApi';

interface SupplementRecommenderProps {
  onRecommendationsReceived?: (recommendations: string) => void;
}

const SupplementRecommender = ({ onRecommendationsReceived }: SupplementRecommenderProps) => {
  const [goal, setGoal] = useState('');
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const { user } = useAuth();
  
  const { loading, error, execute: getRecommendations } = useApi(
    supplementApi.getRecommendations,
    {
      onSuccess: (response) => {
        setRecommendations(response);
        if (onRecommendationsReceived) {
          onRecommendationsReceived(response);
        }
      },
      errorMessage: 'Failed to get recommendations'
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;
    
    await getRecommendations(goal, user?.id);
  };

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
          <h3 className="mb-2 text-lg font-medium">Your Personalized Recommendations</h3>
          <div className="prose prose-sm max-w-none whitespace-pre-wrap">
            {recommendations.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplementRecommender;