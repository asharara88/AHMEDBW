import { supabase } from '../lib/supabaseClient';

// Define deployment status types
export type DeploymentStatus = 'idle' | 'building' | 'deployed' | 'failed' | 'unknown';

export interface DeploymentInfo {
  status: DeploymentStatus;
  deployId?: string;
  deployUrl?: string;
  error?: string;
  lastChecked: Date;
}

/**
 * Checks the deployment status of the application
 * @returns Promise with deployment information
 */
export async function checkDeploymentStatus(deployId?: string): Promise<DeploymentInfo> {
  try {
    // If no deployId is provided, try to get the latest deployment
    if (!deployId) {
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
      
      deployId = deployments[0].id;
    }
    
    // Get deployment status
    const { data: deployment, error: deploymentError } = await supabase
      .from('deployments')
      .select('*')
      .eq('id', deployId)
      .single();
    
    if (deploymentError) {
      console.error(`Failed to fetch deployment: ${deploymentError.message}`);
      return {
        status: 'unknown',
        deployId,
        error: 'Failed to fetch deployment information',
        lastChecked: new Date()
      };
    }
    
    if (!deployment) {
      return {
        status: 'unknown',
        deployId,
        error: 'Deployment not found',
        lastChecked: new Date()
      };
    }
    
    // Map deployment status
    let status: DeploymentStatus;
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
      lastChecked: new Date()
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

/**
 * Polls the deployment status at regular intervals
 * @param deployId The deployment ID to check
 * @param callback Function to call with updated status
 * @param interval Polling interval in milliseconds (default: 5000)
 * @param maxAttempts Maximum number of polling attempts (default: 60 - 5 minutes)
 * @returns A function to cancel polling
 */
export function pollDeploymentStatus(
  deployId: string,
  callback: (info: DeploymentInfo) => void,
  interval = 5000,
  maxAttempts = 60
): () => void {
  let attempts = 0;
  let timeoutId: number | undefined;
  
  const checkStatus = async () => {
    attempts++;
    
    try {
      const info = await checkDeploymentStatus(deployId);
      callback(info);
      
      // Stop polling if deployment is complete or failed, or if max attempts reached
      if (info.status === 'deployed' || info.status === 'failed' || attempts >= maxAttempts) {
        return;
      }
      
      // Continue polling
      timeoutId = window.setTimeout(checkStatus, interval);
    } catch (error) {
      console.error('Error polling deployment status:', error);
      callback({
        status: 'unknown',
        deployId,
        error: error instanceof Error ? error.message : 'Unknown error',
        lastChecked: new Date()
      });
    }
  };
  
  // Start polling
  checkStatus();
  
  // Return function to cancel polling
  return () => {
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
    }
  };
}