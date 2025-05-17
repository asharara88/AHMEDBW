import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../../contexts/SupabaseContext';
import { MessageCircle, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

interface RecentChatsProps {
  userId: string;
}

const RecentChats = ({ userId }: RecentChatsProps) => {
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllChats, setShowAllChats] = useState(false);
  
  const { supabase } = useSupabase();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('chat_history')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (error) throw error;
        setChatHistory(data || []);
      } catch (error) {
        console.error('Error fetching chat history:', error);
        
        // Mock data for demo
        setChatHistory([
          {
            id: '1',
            user_id: userId,
            message: 'What supplements should I take for better sleep?',
            response: 'Based on your sleep patterns, I recommend trying magnesium glycinate (300-400mg) before bed. It helps with muscle relaxation and sleep quality.',
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          },
          {
            id: '2',
            user_id: userId,
            message: 'How can I improve my heart rate variability?',
            response: 'To improve HRV, focus on consistent sleep schedule, breath work (try 4-7-8 breathing), and reduced alcohol consumption.',
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          },
          {
            id: '3',
            user_id: userId,
            message: 'What\'s causing my afternoon energy crash?',
            response: 'Your glucose monitoring shows spikes after lunch. Try adding protein and fiber to meals, and consider a 10-minute walk after eating.',
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChatHistory();
  }, [userId, supabase]);
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };
  
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };
  
  if (loading) {
    return (
      <div className="col-span-9 rounded-xl bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-bold">Health Coach</h2>
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }
  
  // Show only first 2 chats by default on mobile
  const visibleChats = showAllChats ? chatHistory : chatHistory.slice(0, 2);
  
  return (
    <div className="col-span-9 relative rounded-xl bg-white overflow-hidden shadow-md">
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: `url('https://jvqweleqjkrgldeflnfr.supabase.co/storage/v1/object/sign/heroes/COACH2.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzFhYTRlZDEyLWU0N2QtNDcyNi05ZmI0LWQ3MWM5MGFlOTYyZSJ9.eyJ1cmwiOiJoZXJvZXMvQ09BQ0gyLnN2ZyIsImlhdCI6MTc0NTkzMDM0MiwiZXhwIjoxNzc3NDY2MzQyfQ.wc6BUKNjTPqdV4RaDNj8T45TrIhwetUhsy1JOU4v6SQ')`,
          opacity: 0.1
        }}
      />
      
      <div className="relative z-10 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-primary">Health Coach</h2>
          <p className="text-text-light">Your personal health optimization guide</p>
        </div>
        
        <div className="mb-4 space-y-4">
          {chatHistory.length === 0 ? (
            <div className="rounded-lg bg-gray-50 p-4 text-center text-text-light">
              <p>No recent conversations</p>
              <p className="mt-1 text-sm">
                Start chatting with your coach for personalized health advice.
              </p>
            </div>
          ) : (
            visibleChats.map((chat) => (
              <div key={chat.id} className="rounded-lg border border-gray-200 bg-white/80 backdrop-blur p-3">
                <div className="mb-1 flex items-center justify-between">
                  <p className="font-medium">You asked:</p>
                  <span className="text-xs text-text-light">
                    {formatTimestamp(chat.created_at)}
                  </span>
                </div>
                <p className="mb-2 text-sm text-text-light">
                  {truncateText(chat.message, 60)}
                </p>
                <div className="rounded-lg bg-gray-50/80 backdrop-blur p-2 text-sm">
                  <p className="font-medium text-primary">Coach:</p>
                  <p className="text-text-light">
                    {truncateText(chat.response, 100)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Show More/Less Button for Mobile */}
        {chatHistory.length > 2 && (
          <button
            onClick={() => setShowAllChats(!showAllChats)}
            className="mb-4 flex w-full items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white p-2 text-sm text-text-light transition-colors hover:bg-gray-50 hover:text-text sm:hidden"
          >
            {showAllChats ? (
              <>
                Show Less <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Show More ({chatHistory.length - 2}) <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
        )}
        
        <button
          onClick={() => navigate('/chat')}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-white transition-colors hover:bg-primary-dark"
        >
          <MessageCircle className="h-5 w-5" />
          Chat with Health Coach
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default RecentChats;