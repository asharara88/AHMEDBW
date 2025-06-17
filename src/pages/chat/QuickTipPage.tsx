import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import ChatButton from '../../components/chat/ChatButton';

const QuickTipPage = () => {
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