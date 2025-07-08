import { motion } from 'framer-motion';
import { MessageCircle, Moon, Brain, Zap, Coffee, Activity } from 'lucide-react';
import ChatButton from '../../components/chat/ChatButton';
import QuickTipCard from '../../components/chat/QuickTipCard';

const QuickTipPage = () => {
  const quickTips = [
    { 
      title: "Sleep Optimization", 
      description: "Tips for better sleep quality",
      icon: <Moon className="h-4 w-4" />
    },
    { 
      title: "Stress Management", 
      description: "Techniques to reduce daily stress",
      icon: <Brain className="h-4 w-4" />
    },
    { 
      title: "Energy Boosters", 
      description: "Natural ways to increase energy",
      icon: <Zap className="h-4 w-4" />
    },
    { 
      title: "Nutrition Basics", 
      description: "Fundamentals of healthy eating",
      icon: <Coffee className="h-4 w-4" />
    },
    { 
      title: "Workout Recovery", 
      description: "Optimize your post-exercise recovery",
      icon: <Activity className="h-4 w-4" />
    },
    { 
      title: "Focus Enhancement", 
      description: "Improve concentration and mental clarity",
      icon: <Brain className="h-4 w-4" />
    }
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold md:text-2xl">Daily Wellness Tips</h2>
          <p className="text-text-light">
            Get personalized health and wellness advice from your AI coach
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 mb-8">
          {quickTips.map((tip, index) => (
            <QuickTipCard 
              key={index}
              title={tip.title}
              description={tip.description}
              icon={tip.icon}
            />
          ))}
        </div>

        <ChatButton />
        
        <div className="mt-8 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4 text-sm text-text-light">
          <p className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            These tips are personalized based on your health data and goals. For more detailed
            conversations, use the Chat tab.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default QuickTipPage;