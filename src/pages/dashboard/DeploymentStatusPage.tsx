import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import DeploymentStatus from '../../components/deployment/DeploymentStatus';
import { checkDeploymentStatus, DeploymentInfo } from '../../utils/deploymentStatus';
import { getDeploymentStatus } from '../../utils/deploymentApi';

const DeploymentStatusPage = () => {
  const [deploymentInfo, setDeploymentInfo] = useState<DeploymentInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const status = await getDeploymentStatus();
      setDeploymentInfo(status);
    } catch (error) {
      console.error('Error refreshing deployment status:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-2xl font-bold">Deployment Status</h1>
      </div>

      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <DeploymentStatus 
            deployId={deploymentInfo?.deployId} 
            onStatusChange={setDeploymentInfo}
          />

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-4 py-2 text-sm text-text-light transition-colors hover:bg-[hsl(var(--color-card-hover))] hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Refresh Status
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DeploymentStatusPage;