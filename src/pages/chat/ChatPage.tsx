import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import HealthCoach from '../../components/chat/AIHealthCoach';
import ErrorBoundary from '../../components/common/ErrorBoundary';

const ChatPage = () => {
  return (
    <div className="container mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-4xl"
      >
        <div className="mb-6">
          <h1 className="text-2xl font-bold md:text-3xl">Health Coach</h1>
          <p className="text-text-light">
            Chat with your personal coach for evidence-based health advice
          </p>
        </div>

        <div className="h-[calc(100vh-16rem)]">
          <ErrorBoundary>
            <HealthCoach />
          </ErrorBoundary>
        </div>

        <div className="mt-4 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4 text-sm text-text-light">
          <p className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" aria-hidden="true" />
            <span>
              Always consult with healthcare professionals before making significant changes to your health regimen.
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatPage;