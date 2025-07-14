import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const FloatingChatButton = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <motion.button
        onClick={() => navigate('/chat')}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-all hover:bg-primary-dark"
        aria-label="Chat with MyCoach"
      >
        <img 
          src="https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/icons-favicons/stack%20dash%20metalic%20favicon.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82ZjcyOGVhMS1jMTdjLTQ2MTYtOWFlYS1mZmI3MmEyM2U5Y2EiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpY29ucy1mYXZpY29ucy9zdGFjayBkYXNoIG1ldGFsaWMgZmF2aWNvbi5zdmciLCJpYXQiOjE3NTAyMjM3ODIsImV4cCI6MTc4MTc1OTc4Mn0.KAQKnXmX53yE90FyM0amSoQ5dU081iUIaTc72NUfGOY" 
          alt="Chat" 
          className="h-8 w-8"
          loading="lazy"
        />
      </motion.button>
    </motion.div>
  );
};

export default FloatingChatButton;