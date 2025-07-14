import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Watch, CheckCircle } from 'lucide-react';

const ConnectCard = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="group flex h-full flex-col overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl"
    >
      <div className="flex flex-1 flex-col justify-between bg-[hsl(var(--color-card))] p-6">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <Watch className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">Connect</h3>
          </div>
          
          <p className="mb-4 text-text-light">Sync your wearables and complete a quick health assessment.</p>

          <div className="mb-4 space-y-2">
            {['Wearable devices', 'Health quiz', 'Lab results'].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
          
          <button
            onClick={toggleExpanded}
            className="text-primary underline text-sm focus:outline-none"
          >
            {isExpanded ? 'Hide details' : 'Learn more'}
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-2 text-xs text-text-light space-y-1"
              >
                <ul className="list-disc pl-5 space-y-1">
                  <li>Health Platforms</li>
                  <li>Wearables</li>
                  <li>Chest-Straps & Sensors</li>
                  <li>Continuous Monitoring</li>
                  <li>Smart Home & Environmental</li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default ConnectCard;