import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader, CheckCircle, AlertCircle, Download, Database, FileText, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { importSupplementsFromCsv, uploadSupplementsToSupabase } from '../../utils/importSupplements';
import type { Supplement } from '../../types/supplements';

const ImportSupplementsPage = () => {
  const [csvUrl, setCsvUrl] = useState('https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/supplementsdemo/Supplement%20Demo%20DB/supplements_final_db_ready.csv?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82ZjcyOGVhMS1jMTdjLTQ2MTYtOWFlYS1mZmI3MmEyM2U5Y2EiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzdXBwbGVtZW50c2RlbW8vU3VwcGxlbWVudCBEZW1vIERCL3N1cHBsZW1lbnRzX2ZpbmFsX2RiX3JlYWR5LmNzdiIsImlhdCI6MTc1MTA4ODU4MSwiZXhwIjoxODc3MjMyNTgxfQ.bx0eYp4ONd2ROc2RJbcUTcV05bDS6oRTNyusfgRDRqE');
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { user } = useAuth();
  
  const fetchSupplements = async () => {
    if (!csvUrl) {
      setError('Please enter a CSV URL');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const data = await importSupplementsFromCsv(csvUrl);
      setSupplements(data);
      setSuccess(`Successfully fetched ${data.length} supplements from CSV`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch supplements');
    } finally {
      setLoading(false);
    }
  };
  
  const handleImport = async () => {
    if (supplements.length === 0) {
      setError('No supplements to import');
      return;
    }
    
    setImporting(true);
    setError(null);
    setSuccess(null);
    
    try {
      await uploadSupplementsToSupabase(supplements);
      setSuccess(`Successfully imported ${supplements.length} supplements to the database`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import supplements');
    } finally {
      setImporting(false);
    }
  };
  
  // Fetch supplements on mount
  useEffect(() => {
    if (csvUrl) {
      fetchSupplements();
    }
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6">
          <h1 className="text-2xl font-bold md:text-3xl">Import Supplements</h1>
          <p className="text-text-light">
            Import supplement data from a CSV file to populate the database
          </p>
        </div>
        
        <div className="mb-6 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-6 shadow-md">
          <h2 className="mb-4 text-xl font-bold">CSV Import</h2>
          
          <div className="mb-4">
            <label htmlFor="csvUrl" className="mb-2 block text-sm font-medium">
              CSV URL
            </label>
            <div className="flex gap-2">
              <input
                id="csvUrl"
                type="text"
                value={csvUrl}
                onChange={(e) => setCsvUrl(e.target.value)}
                className="flex-1 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-4 py-2 text-text placeholder:text-text-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Enter CSV URL"
              />
              <button
                onClick={fetchSupplements}
                disabled={loading || !csvUrl}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>Fetching...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    <span>Fetch CSV</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-error/10 p-3 text-sm text-error">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-success">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <p>{success}</p>
            </div>
          )}
          
          {supplements.length > 0 && (
            <div className="mb-4 rounded-lg bg-[hsl(var(--color-surface-1))] p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-medium">Supplement Data Preview</h3>
                <span className="text-sm text-text-light">{supplements.length} supplements</span>
              </div>
              
              <div className="mb-4 max-h-60 overflow-y-auto rounded-lg border border-[hsl(var(--color-border))]">
                <table className="w-full border-collapse">
                  <thead className="bg-[hsl(var(--color-card-hover))]">
                    <tr>
                      <th className="border-b border-[hsl(var(--color-border))] p-2 text-left text-sm font-medium">Name</th>
                      <th className="border-b border-[hsl(var(--color-border))] p-2 text-left text-sm font-medium">Evidence Level</th>
                      <th className="border-b border-[hsl(var(--color-border))] p-2 text-left text-sm font-medium">Price (AED)</th>
                      <th className="border-b border-[hsl(var(--color-border))] p-2 text-left text-sm font-medium">Categories</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplements.slice(0, 10).map((supplement, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-[hsl(var(--color-surface-1))]' : 'bg-[hsl(var(--color-card))]'}>
                        <td className="border-b border-[hsl(var(--color-border))] p-2 text-sm">{supplement.name}</td>
                        <td className="border-b border-[hsl(var(--color-border))] p-2 text-sm">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            supplement.evidence_level === 'Green' 
                              ? 'bg-success/10 text-success' 
                              : supplement.evidence_level === 'Yellow'
                                ? 'bg-warning/10 text-warning'
                                : 'bg-error/10 text-error'
                          }`}>
                            {supplement.evidence_level}
                          </span>
                        </td>
                        <td className="border-b border-[hsl(var(--color-border))] p-2 text-sm">{supplement.price_aed}</td>
                        <td className="border-b border-[hsl(var(--color-border))] p-2 text-sm">
                          <div className="flex flex-wrap gap-1">
                            {supplement.categories?.slice(0, 2).map((category, i) => (
                              <span key={i} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                                {category}
                              </span>
                            ))}
                            {(supplement.categories?.length || 0) > 2 && (
                              <span className="rounded-full bg-[hsl(var(--color-surface-2))] px-2 py-0.5 text-xs text-text-light">
                                +{(supplement.categories?.length || 0) - 2} more
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {supplements.length > 10 && (
                <p className="text-xs text-text-light">
                  Showing 10 of {supplements.length} supplements
                </p>
              )}
              
              <div className="flex justify-end">
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {importing ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      <span>Importing...</span>
                    </>
                  ) : (
                    <>
                      <Database className="h-5 w-5" />
                      <span>Import to Database</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2 rounded-lg bg-[hsl(var(--color-surface-1))] p-3 text-sm text-text-light">
            <FileText className="h-5 w-5 text-primary" />
            <p>
              The CSV file should contain columns for name, description, categories, evidence_level, price_aed, and other supplement properties.
            </p>
          </div>
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-4 py-2 font-medium text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
          >
            Back
          </button>
          
          <button
            onClick={fetchSupplements}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-4 py-2 font-medium text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
          >
            <RefreshCw className="h-5 w-5" />
            <span>Refresh Data</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ImportSupplementsPage;