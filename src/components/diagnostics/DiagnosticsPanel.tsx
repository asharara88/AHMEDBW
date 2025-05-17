import { useState, useEffect } from 'react';
import { runAllDiagnostics, checkEnvironmentVariables } from '../../utils/diagnostics';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

const DiagnosticsPanel = () => {
  const [results, setResults] = useState<Record<string, any> | null>(null);
  const [envVarResults, setEnvVarResults] = useState<{ success: boolean; details: Record<string, boolean> } | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDiagnostics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check environment variables
      const envResult = checkEnvironmentVariables();
      setEnvVarResults(envResult);
      
      // Only proceed with API checks if environment variables are present
      if (envResult.success) {
        const diagnosticResults = await runAllDiagnostics();
        setResults(diagnosticResults);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (success: boolean | undefined) => {
    if (success === undefined) return <AlertTriangle className="h-5 w-5 text-warning" />;
    return success ? 
      <CheckCircle className="h-5 w-5 text-success" /> : 
      <XCircle className="h-5 w-5 text-error" />;
  };

  return (
    <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">System Diagnostics</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={runDiagnostics}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-1.5 text-sm text-text-light transition-colors hover:bg-[hsl(var(--color-card-hover))] hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {loading ? 'Running...' : 'Run Diagnostics'}
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-1.5 text-text-light transition-colors hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-error/10 p-3 text-sm text-error">
          <p className="font-medium">Error running diagnostics</p>
          <p>{error}</p>
        </div>
      )}

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3">
          <div className="flex items-center gap-3">
            {getStatusIcon(envVarResults?.success)}
            <span>Environment Variables</span>
          </div>
          <span className={`text-sm ${envVarResults?.success ? 'text-success' : 'text-error'}`}>
            {envVarResults?.success ? 'OK' : 'Failed'}
          </span>
        </div>

        {results && (
          <>
            <div className="flex items-center justify-between rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3">
              <div className="flex items-center gap-3">
                {getStatusIcon(results.supabase?.success)}
                <span>Supabase Connection</span>
              </div>
              <span className={`text-sm ${results.supabase?.success ? 'text-success' : 'text-error'}`}>
                {results.supabase?.success ? 'OK' : 'Failed'}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3">
              <div className="flex items-center gap-3">
                {getStatusIcon(results.openai?.success)}
                <span>OpenAI Proxy</span>
              </div>
              <span className={`text-sm ${results.openai?.success ? 'text-success' : 'text-error'}`}>
                {results.openai?.success ? 'OK' : 'Failed'}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3">
              <div className="flex items-center gap-3">
                {getStatusIcon(results.chatHistory?.success)}
                <span>Chat History Access</span>
              </div>
              <span className={`text-sm ${results.chatHistory?.success ? 'text-success' : 'text-error'}`}>
                {results.chatHistory?.success ? 'OK' : 'Failed'}
              </span>
            </div>
          </>
        )}
      </div>

      {expanded && results && (
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-4">
            <h3 className="mb-2 text-sm font-medium">Environment Variables</h3>
            <pre className="overflow-x-auto rounded-lg bg-[hsl(var(--color-card))] p-3 text-xs">
              {JSON.stringify(envVarResults?.details, null, 2)}
            </pre>
          </div>

          <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-4">
            <h3 className="mb-2 text-sm font-medium">Supabase Connection</h3>
            <pre className="overflow-x-auto rounded-lg bg-[hsl(var(--color-card))] p-3 text-xs">
              {JSON.stringify(results.supabase, null, 2)}
            </pre>
          </div>

          <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-4">
            <h3 className="mb-2 text-sm font-medium">OpenAI Proxy</h3>
            <pre className="overflow-x-auto rounded-lg bg-[hsl(var(--color-card))] p-3 text-xs">
              {JSON.stringify({
                success: results.openai.success,
                message: results.openai.message,
                // Omit full response details to avoid cluttering the UI
                details: results.openai.details ? 'Response received' : results.openai.details
              }, null, 2)}
            </pre>
          </div>

          <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-4">
            <h3 className="mb-2 text-sm font-medium">Chat History Access</h3>
            <pre className="overflow-x-auto rounded-lg bg-[hsl(var(--color-card))] p-3 text-xs">
              {JSON.stringify(results.chatHistory, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <div className="mt-4 rounded-lg bg-[hsl(var(--color-surface-1))] p-3 text-sm text-text-light">
        <p>
          {loading ? 'Running diagnostics...' : 
           error ? 'Diagnostics failed with errors' :
           !results ? 'Waiting for results...' :
           Object.values(results).every(r => r.success) ? 
             'All systems operational' : 
             'Some systems are experiencing issues'}
        </p>
      </div>
    </div>
  );
};

export default DiagnosticsPanel;