import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Activity, ChevronRight } from 'lucide-react';
import HealthCoach from '../../components/chat/AIHealthCoach';
import { Link, Outlet, useLocation } from 'react-router-dom';

const ChatPage = () => {
  const location = useLocation();
  const isMainChat = location.pathname === '/chat';

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
            Evidence-based health advice and personalized insights
          </p>
        </div>

        <div className="mb-6 flex space-x-4">
          <Link
            to="/chat"
            className={`flex items-center rounded-lg px-4 py-2 ${
              isMainChat 
                ? 'bg-primary text-white' 
                : 'bg-[hsl(var(--color-card))] text-text-light hover:bg-[hsl(var(--color-card-hover))]'
            }`}
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Chat
          </Link>
          <Link
            to="/chat/quick-tips"
            className={`flex items-center rounded-lg px-4 py-2 ${
              !isMainChat 
                ? 'bg-primary text-white' 
                : 'bg-[hsl(var(--color-card))] text-text-light hover:bg-[hsl(var(--color-card-hover))]'
            }`}
          >
            <Activity className="mr-2 h-5 w-5" />
            Quick Tips
          </Link>
        </div>

        {isMainChat ? (
          <>
            <div className="h-[calc(100vh-16rem)]">
              <HealthCoach />
            </div>

            <div className="mt-4 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4 text-sm text-text-light">
              <p className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-primary" />
                <span>
                  Always consult with healthcare professionals before making significant changes to your health regimen.
                </span>
              </p>
            </div>
          </>
        ) : (
          <Outlet />
        )}
      </motion.div>
    </div>
  );
};

export default ChatPage;