import { supabase } from '../lib/supabaseClient';
import { DeploymentInfo } from './deploymentStatus';

/**
 * Fetches the current deployment status from the API
 * @returns Promise with deployment information
 */
export async function getDeploymentStatus(): Promise<DeploymentInfo> {
  try {
    const { data: deployments, error: deploymentsError } = await supabase
      .from('deployments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (deploymentsError) {
      console.error(`Failed to fetch deployments: ${deploymentsError.message}`);
      return {
        status: 'unknown',
        error: 'Failed to fetch deployment information',
        lastChecked: new Date()
      };
    }
    
    if (!deployments || deployments.length === 0) {
      return {
        status: 'idle',
        lastChecked: new Date()
      };
    }
    
    const deployment = deployments[0];
    
    // Map deployment status
    let status: 'idle' | 'building' | 'deployed' | 'failed' | 'unknown';
    switch (deployment.status) {
      case 'building':
      case 'queued':
        status = 'building';
        break;
      case 'ready':
      case 'complete':
      case 'deployed':
        status = 'deployed';
        break;
      case 'failed':
      case 'error':
        status = 'failed';
        break;
      default:
        status = 'unknown';
    }
    
    return {
      status,
      deployId: deployment.id,
      deployUrl: deployment.url,
      error: deployment.error_message,
      lastChecked: new Date(),
      claimed: deployment.claimed,
      claim_url: deployment.claim_url
    };
  } catch (error) {
    console.error('Error checking deployment status:', error);
    return {
      status: 'unknown',
      error: error instanceof Error ? error.message : 'Unknown error',
      lastChecked: new Date()
    };
  }
}