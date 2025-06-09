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
          src="https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/logos/white%20Log%20trnspt%20bg.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5X2UyYTcyNGEyLTZkNTctNDk4YS04ZGU1LWY2Y2Q4MjAyNjA3YiJ9.eyJ1cmwiOiJsb2dvcy93aGl0ZSBMb2cgdHJuc3B0IGJnLnN2ZyIsImlhdCI6MTc0NzI3MzEwNywiZXhwIjoxNzc4ODA5MTA3fQ.GI2ed8ie67PgVxVEoJsSWQXsv_Zki1V5ub7jfQCW-hg"
          alt="Biowell Chat"
          className="h-8 w-8"
          loading="lazy"
        />
      </motion.button>
    </motion.div>
  );
};

export default FloatingChatButton;