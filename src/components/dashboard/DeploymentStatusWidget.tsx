import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Rocket, ExternalLink, Loader, AlertCircle } from 'lucide-react';
import { checkDeploymentStatus, DeploymentInfo, getCachedDeploymentStatus, cacheDeploymentStatus } from '../../utils/deploymentStatus';

const DeploymentStatusWidget = () => {
  const [deploymentInfo, setDeploymentInfo] = useState<DeploymentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        // Try to get cached status first for immediate display
        const cachedStatus = getCachedDeploymentStatus();
        if (cachedStatus) {
          setDeploymentInfo(cachedStatus);
          setLoading(false);
        }
        
        // Fetch fresh status
        const status = await checkDeploymentStatus();
        setDeploymentInfo(status);
        
        // Cache the new status
        cacheDeploymentStatus(status);
        
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch deployment status');
        console.error('Error fetching deployment status:', error);
        setLoading(false);
      }
    };

    fetchStatus();
    
    // Set up polling to check status every 30 seconds if still building
    const intervalId = setInterval(async () => {
      if (deploymentInfo?.status === 'building') {
        fetchStatus();
      }
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [deploymentInfo?.status]);

  if (loading && !deploymentInfo) {
    return (
      <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4 text-center">
        <Loader className="h-5 w-5 animate-spin text-primary mx-auto" />
        <p className="mt-2 text-sm text-text-light">Checking deployment status...</p>
      </div>
    );
  }

  if (error && !deploymentInfo) {
    return (
      <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4 text-center">
        <AlertCircle className="h-5 w-5 text-error mx-auto" />
        <p className="mt-2 text-sm text-text-light">{error}</p>
      </div>
    );
  }

  if (!deploymentInfo) return null;

  return (
    <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Deployment Status</h3>
        </div>
        {deploymentInfo.status === 'deployed' && (
          <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
            Live
          </span>
        )}
        {deploymentInfo.status === 'building' && (
          <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
            Building
          </span>
        )}
        {deploymentInfo.status === 'failed' && (
          <span className="rounded-full bg-error/10 px-2 py-0.5 text-xs font-medium text-error">
            Failed
          </span>
        )}
      </div>

      {deploymentInfo.deployUrl && (
        <div className="mb-3 flex items-center justify-between rounded-lg bg-[hsl(var(--color-surface-1))] p-3">
          <span className="text-xs text-text-light">Site URL</span>
          <a
            href={deploymentInfo.deployUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            {deploymentInfo.deployUrl.replace(/^https?:\/\//, '')}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

      {deploymentInfo.claimUrl && (
        <div className="mb-3 rounded-lg bg-primary/5 p-3">
          <p className="text-xs">
            <span className="font-medium">Transfer site:</span> You can claim this Netlify site to your own account.
          </p>
          <a
            href={deploymentInfo.claimUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
          >
            Claim site <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

      {deploymentInfo.status === 'building' && (
        <div className="mb-3 rounded-lg bg-[hsl(var(--color-surface-1))] p-3">
          <div className="flex items-center gap-2">
            <Loader className="h-4 w-4 animate-spin text-primary" />
            <p className="text-xs">Building your site...</p>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[hsl(var(--color-border))]">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-primary"></div>
          </div>
        </div>
      )}

      <Link
        to="/deployment-status"
        className="flex w-full items-center justify-center gap-1 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2 text-xs text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
      >
        View Details
      </Link>
    </div>
  );
};

export default DeploymentStatusWidget;