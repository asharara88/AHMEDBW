import { motion } from 'framer-motion';
import { Activity, Brain, Heart, ArrowRight } from 'lucide-react';

interface OnboardingWelcomeProps {
  onStart: () => void;
}

const OnboardingWelcome = ({ onStart }: OnboardingWelcomeProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-[hsl(var(--color-card))] p-8 text-center shadow-lg"
    >
      <div className="mb-6 flex justify-center">
        <div className="relative">
          <div className="absolute -left-4 -top-4 h-12 w-12 rounded-full bg-primary/10 p-3">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div className="absolute -right-4 -top-4 h-12 w-12 rounded-full bg-success/10 p-3">
            <Heart className="h-6 w-6 text-success" />
          </div>
          <div className="h-20 w-20 rounded-full bg-primary/20 p-5">
            <Activity className="h-10 w-10 text-primary" />
          </div>
        </div>
      </div>
      
      <h2 className="mb-4 text-2xl font-bold">Welcome to Biowell</h2>
      
      <p className="mb-6 text-text-light">
        Let's set up your personalized health profile to get the most out of your experience.
      </p>
      
      <div className="mb-8 space-y-4">
        <div className="rounded-lg bg-[hsl(var(--color-surface-1))] p-4">
          <h3 className="mb-2 font-medium">What to expect:</h3>
          <ul className="space-y-2 text-left text-sm text-text-light">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">1</span>
              <span>A few questions about you and your health goals</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">2</span>
              <span>Personalized dashboard setup based on your needs</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">3</span>
              <span>Custom health recommendations and insights</span>
            </li>
          </ul>
        </div>
        
        <div className="rounded-lg bg-[hsl(var(--color-surface-1))] p-4 text-left">
          <p className="text-sm text-text-light">
            <span className="font-medium text-text">Privacy note:</span> Your information is secure and will only be used to personalize your experience. We never share your data with third parties.
          </p>
        </div>
      </div>
      
      <button
        onClick={onStart}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary-dark"
      >
        Get Started
        <ArrowRight className="h-5 w-5" />
      </button>
    </motion.div>
  );
};

export default OnboardingWelcome;