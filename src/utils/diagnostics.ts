import { supabase } from '../lib/supabaseClient';

export interface DiagnosticResult {
  service: string;
  status: 'ok' | 'error';
  message: string;
}

export function checkEnvironmentVariables(): { success: boolean; details: Record<string, boolean> } {
  const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  const details: Record<string, boolean> = {};
  
  for (const varName of requiredVars) {
    details[varName] = !!import.meta.env[varName];
  }
  
  const success = Object.values(details).every(Boolean);
  
  return {
    success,
    details
  };
}

export async function runAllDiagnostics(): Promise<Record<string, any>> {
  const results: Record<string, any> = {};
  
  // Check environment variables
  const envVarCheck = checkEnvironmentVariables();
  if (!envVarCheck.success) {
    return {
      supabase: { success: false, message: 'Missing required environment variables' },
      openai: { success: false, message: 'Missing required environment variables' },
      chatHistory: { success: false, message: 'Missing required environment variables' }
    };
  }
  
  // Check Supabase connection
  try {
    const { data, error } = await supabase.from('supplements').select('id').limit(1);
    
    results.supabase = {
      success: !error,
      message: error ? `Connection error: ${error.message}` : 'Successfully connected to Supabase',
      details: error ? error : { data }
    };
  } catch (error) {
    results.supabase = {
      success: false,
      message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
      details: error
    };
  }
  
  // Check OpenAI proxy endpoint
  try {
    const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-assistant`;
    const response = await fetch(functionUrl, {
      method: 'OPTIONS',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    results.openai = {
      success: response.ok,
      message: response.ok ? 'OpenAI proxy endpoint is accessible' : `OpenAI proxy endpoint returned status ${response.status}`,
      details: { status: response.status, statusText: response.statusText }
    };
  } catch (error) {
    results.openai = {
      success: false,
      message: `Failed to access OpenAI proxy: ${error instanceof Error ? error.message : String(error)}`,
      details: error
    };
  }
  
  // Check chat history access
  try {
    const { data, error } = await supabase.from('chat_history').select('id').limit(1);
    
    results.chatHistory = {
      success: !error,
      message: error ? `Chat history access error: ${error.message}` : 'Successfully accessed chat history',
      details: error ? error : { data }
    };
  } catch (error) {
    results.chatHistory = {
      success: false,
      message: `Unexpected error accessing chat history: ${error instanceof Error ? error.message : String(error)}`,
      details: error
    };
  }
  
  // Check deployments table
  try {
    const { data, error } = await supabase.from('deployments').select('id').limit(1);
    
    results.deployments = {
      success: !error,
      message: error ? `Deployments table access error: ${error.message}` : 'Successfully accessed deployments table',
      details: error ? error : { data }
    };
  } catch (error) {
    results.deployments = {
      success: false,
      message: `Unexpected error accessing deployments table: ${error instanceof Error ? error.message : String(error)}`,
      details: error
    };
  }
  
  return results;
}

export async function runDiagnostics(): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [];
  
  // Check environment variables
  const envVarCheck = checkEnvironmentVariables();
  
  if (!envVarCheck.success) {
    results.push({
      service: 'Environment',
      status: 'error',
      message: 'Missing required environment variables. Check .env file.'
    });
  } else {
    results.push({
      service: 'Environment',
      status: 'ok',
      message: 'All required environment variables found.'
    });
  }
  
  // Check Supabase connection
  try {
    const { data, error } = await supabase.from('supplements').select('id').limit(1);
    
    if (error) {
      results.push({
        service: 'Supabase',
        status: 'error',
        message: `Connection error: ${error.message}`
      });
    } else {
      results.push({
        service: 'Supabase',
        status: 'ok',
        message: 'Successfully connected to Supabase.'
      });
    }
  } catch (error) {
    results.push({
      service: 'Supabase',
      status: 'error',
      message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`
    });
  }
  
  // Check OpenAI proxy endpoint
  try {
    const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-assistant`;
    const response = await fetch(functionUrl, {
      method: 'OPTIONS',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (response.ok) {
      results.push({
        service: 'OpenAI Proxy',
        status: 'ok',
        message: 'OpenAI proxy endpoint is accessible.'
      });
    } else {
      results.push({
        service: 'OpenAI Proxy',
        status: 'error',
        message: `OpenAI proxy endpoint returned status ${response.status}`
      });
    }
  } catch (error) {
    results.push({
      service: 'OpenAI Proxy',
      status: 'error',
      message: `Failed to access OpenAI proxy: ${error instanceof Error ? error.message : String(error)}`
    });
  }
  
  // Check deployments table
  try {
    const { data, error } = await supabase.from('deployments').select('id').limit(1);
    
    if (error) {
      results.push({
        service: 'Deployments',
        status: 'error',
        message: `Deployments table error: ${error.message}`
      });
    } else {
      results.push({
        service: 'Deployments',
        status: 'ok',
        message: 'Successfully accessed deployments table.'
      });
    }
  } catch (error) {
    results.push({
      service: 'Deployments',
      status: 'error',
      message: `Failed to access deployments table: ${error instanceof Error ? error.message : String(error)}`
    });
  }
  
  return results;
}