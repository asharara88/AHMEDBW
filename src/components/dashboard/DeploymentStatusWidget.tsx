import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Rocket, ExternalLink } from 'lucide-react';
import { checkDeploymentStatus, DeploymentInfo } from '../../utils/deploymentStatus';

const DeploymentStatusWidget = () => {
  const [deploymentInfo, setDeploymentInfo] = useState<DeploymentInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const status = await checkDeploymentStatus();
        setDeploymentInfo(status);
      } catch (error) {
        console.error('Error fetching deployment status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4 text-center">
        <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!deploymentInfo) {
    return null;
  }

  return (
    <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Deployment</h3>
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
            Visit site <ExternalLink className="h-3 w-3" />
          </a>
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