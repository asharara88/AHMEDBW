import { logError } from './logger';

export interface DeploymentInfo {
  status: 'deployed' | 'building' | 'failed';
  deployUrl?: string;
  claimUrl?: string;
  claimed?: boolean;
  deployId?: string;
}

/**
 * Checks the deployment status of the application
 * This function calls the Netlify API to get the current deployment status
 */
export async function checkDeploymentStatus(): Promise<DeploymentInfo> {
  try {
    // Call the getDeploymentStatus tool to fetch real deployment information
    const response = await getDeploymentStatus({});
    
    return {
      status: response.status,
      deployUrl: response.deploy_url,
      claimUrl: response.claim_url,
      claimed: response.claimed,
      deployId: response.deploy_id
    };
  } catch (error) {
    logError('Error checking deployment status:', error);
    return {
      status: 'failed'
    };
  }
}

/**
 * Gets the current deployment status from the local storage cache
 * This is used as a fallback when the API call fails
 */
export function getCachedDeploymentStatus(): DeploymentInfo | null {
  try {
    const cached = localStorage.getItem('deployment-status');
    if (!cached) return null;
    
    return JSON.parse(cached);
  } catch (error) {
    logError('Error reading cached deployment status:', error);
    return null;
  }
}

/**
 * Saves the deployment status to local storage for caching
 */
export function cacheDeploymentStatus(info: DeploymentInfo): void {
  try {
    localStorage.setItem('deployment-status', JSON.stringify(info));
  } catch (error) {
    logError('Error caching deployment status:', error);
  }
}