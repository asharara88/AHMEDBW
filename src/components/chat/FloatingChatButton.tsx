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
        aria-label="Chat with Health Coach"
      >
        <img 
          src="https://jvqweleqjkrgldeflnfr.supabase.co/storage/v1/object/sign/heroes/STACKDASH.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzFhYTRlZDEyLWU0N2QtNDcyNi05ZmI0LWQ3MWM5MGFlOTYyZSJ9.eyJ1cmwiOiJoZXJvZXMvU1RBQ0tEQVNILnN2ZyIsImlhdCI6MTc0NzAxNTM3MSwiZXhwIjoxNzc4NTUxMzcxfQ.fumrYJiZDGZ36gbwlOVcWHsqs5uFiYRBAhtaT_tnQlM" 
          alt="Chat" 
          className="h-8 w-8"
          loading="lazy"
        />
      </motion.button>
    </motion.div>
  );
};

export default FloatingChatButton;