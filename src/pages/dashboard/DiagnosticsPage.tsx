import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import DiagnosticsPanel from '../../components/diagnostics/DiagnosticsPanel';

const DiagnosticsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-text-light hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <h1 className="text-2xl font-bold">System Diagnostics</h1>
      </div>

      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <DiagnosticsPanel />
        </motion.div>
      </div>
    </div>
  );
};

export default DiagnosticsPage;