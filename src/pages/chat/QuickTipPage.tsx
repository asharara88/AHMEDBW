import { motion } from 'framer-motion';
import ChatButton from '../../components/chat/ChatButton';

const QuickTipPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-2xl"
      >
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold md:text-3xl">Daily Wellness Tips</h1>
          <p className="text-text-light">
            Get personalized health and wellness advice from your AI coach
          </p>
        </div>

        <ChatButton />
        
        <div className="mt-8 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4 text-sm text-text-light">
          <p>
            These tips are personalized based on your health data and goals. For more detailed
            conversations, visit the Coach page.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default QuickTipPage;