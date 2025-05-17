import { useState, useEffect } from 'react';
import { checkDeploymentStatus, pollDeploymentStatus, DeploymentInfo } from '../../utils/deploymentStatus';
import { Loader, CheckCircle, XCircle, AlertTriangle, ExternalLink } from 'lucide-react';

interface DeploymentStatusProps {
  deployId?: string;
  onStatusChange?: (status: DeploymentInfo) => void;
  className?: string;
}

const DeploymentStatus = ({ deployId, onStatusChange, className = '' }: DeploymentStatusProps) => {
  const [deploymentInfo, setDeploymentInfo] = useState<DeploymentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelPolling: (() => void) | undefined;

    const fetchStatus = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Initial check
        const initialStatus = await checkDeploymentStatus(deployId);
        setDeploymentInfo(initialStatus);
        onStatusChange?.(initialStatus);
        
        // If deployment is in progress, start polling
        if (initialStatus.status === 'building') {
          cancelPolling = pollDeploymentStatus(
            initialStatus.deployId || '',
            (info) => {
              setDeploymentInfo(info);
              onStatusChange?.(info);
            }
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to check deployment status');
        console.error('Error fetching deployment status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();

    return () => {
      if (cancelPolling) {
        cancelPolling();
      }
    };
  }, [deployId, onStatusChange]);

  const getStatusIcon = () => {
    if (loading) return <Loader className="h-5 w-5 animate-spin text-primary" />;
    
    if (!deploymentInfo) return <AlertTriangle className="h-5 w-5 text-warning" />;
    
    switch (deploymentInfo.status) {
      case 'building':
        return <Loader className="h-5 w-5 animate-spin text-primary" />;
      case 'deployed':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-error" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-warning" />;
    }
  };

  const getStatusText = () => {
    if (loading) return 'Checking deployment status...';
    
    if (!deploymentInfo) return 'Unknown deployment status';
    
    switch (deploymentInfo.status) {
      case 'idle':
        return 'No active deployment';
      case 'building':
        return 'Deployment in progress...';
      case 'deployed':
        return 'Deployment successful';
      case 'failed':
        return `Deployment failed: ${deploymentInfo.error || 'Unknown error'}`;
      default:
        return 'Unknown deployment status';
    }
  };

  return (
    <div className={`rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <h3 className="text-sm font-medium">Deployment Status</h3>
            <p className="text-xs text-text-light">{getStatusText()}</p>
          </div>
        </div>
        
        {deploymentInfo?.deployUrl && deploymentInfo.status === 'deployed' && (
          <a
            href={deploymentInfo.deployUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-dark"
          >
            View Site <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
      
      {error && (
        <div className="mt-2 rounded-lg bg-error/10 p-2 text-xs text-error">
          {error}
        </div>
      )}
      
      {deploymentInfo?.lastChecked && (
        <div className="mt-2 text-right text-xs text-text-light">
          Last checked: {deploymentInfo.lastChecked.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default DeploymentStatus;