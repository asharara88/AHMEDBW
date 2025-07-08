import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Check, Download, Upload, RefreshCw, FileText, Database } from 'lucide-react';
import importSupplementsFromCsv from '../../scripts/importSupplementsFromCsv';
import { supabase } from '../../lib/supabaseClient';

const ImportSupplementsPage = () => {
  const [supplements, setSupplements] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [importing, setImporting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<'csv' | 'database'>('csv');
  const [dbSupplements, setDbSupplements] = useState<any[]>([]);
  const [dbLoading, setDbLoading] = useState<boolean>(false);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchCsvData();
  }, []);
  
  const fetchCsvData = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Fetch CSV data from public folder
      const response = await fetch('/data/supplement_report_with_whey_variants.csv');
      const csvText = await response.text();
      
      // Parse CSV using Papa Parse (browser version)
      const Papa = await import('papaparse');
      const result = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true
      });
      
      if (result.errors && result.errors.length > 0) {
        console.error('CSV parsing errors:', result.errors);
      }
      
      setSupplements(result.data);
      setSuccess(`Successfully loaded ${result.data.length} supplements from CSV`);
    } catch (err) {
      setError(`Error loading supplement data: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchDatabaseSupplements = async () => {
    setDbLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('supplements')
        .select('*')
        .limit(100);
      
      if (error) throw error;
      
      setDbSupplements(data || []);
    } catch (err) {
      setError(`Error fetching supplements from database: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setDbLoading(false);
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
      const result = await importSupplementsFromCsv();
      
      if (result.success) {
        setSuccess(result.message);
        // Refresh database tab data
        fetchDatabaseSupplements();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(`Error importing supplements: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setImporting(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Import Supplements</h1>
      
      {/* Action Buttons */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={fetchCsvData}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5" />}
          {loading ? 'Loading...' : 'Load CSV Data'}
        </button>
        
        <button
          onClick={handleImport}
          disabled={importing || supplements.length === 0}
          className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700 disabled:opacity-50"
        >
          {importing ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
          {importing ? 'Importing...' : 'Import to Database'}
        </button>
        
        <button
          onClick={fetchDatabaseSupplements}
          disabled={dbLoading}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 hover:bg-purple-700 disabled:opacity-50"
        >
          {dbLoading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Database className="h-5 w-5" />}
          {dbLoading ? 'Loading...' : 'View Database'}
        </button>
      </div>
      
      {/* Status Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-300 rounded-lg flex items-start gap-3">
          <Check className="h-5 w-5 text-green-500 mt-0.5" />
          <p className="text-green-700">{success}</p>
        </div>
      )}
      
      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500">
          <li className="mr-2">
            <button
              onClick={() => setCurrentTab('csv')}
              className={`inline-flex items-center p-4 border-b-2 rounded-t-lg group ${
                currentTab === 'csv'
                  ? 'text-blue-600 border-blue-600'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
            >
              <FileText className="w-4 h-4 mr-2" />
              CSV Data
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => {
                setCurrentTab('database');
                if (dbSupplements.length === 0) {
                  fetchDatabaseSupplements();
                }
              }}
              className={`inline-flex items-center p-4 border-b-2 rounded-t-lg group ${
                currentTab === 'database'
                  ? 'text-blue-600 border-blue-600'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
            >
              <Database className="w-4 h-4 mr-2" />
              Database
            </button>
          </li>
        </ul>
      </div>
      
      {/* Data Display */}
      {currentTab === 'csv' ? (
        loading ? (
          <div className="flex justify-center items-center h-64">
            <RefreshCw className="h-10 w-10 text-blue-500 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
              <thead className="bg-gray-100">
                <tr>
                  {supplements.length > 0 &&
                    Object.keys(supplements[0]).slice(0, 10).map((key) => (
                      <th key={key} className="px-4 py-2 text-left text-gray-600">
                        {key}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {supplements.slice(0, 20).map((supplement, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    {Object.entries(supplement).slice(0, 10).map(([key, value], valueIndex) => (
                      <td key={valueIndex} className="px-4 py-2 border-t border-gray-200">
                        {typeof value === 'string' && value.length > 100
                          ? `${value.substring(0, 100)}...`
                          : value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {supplements.length > 20 && (
              <div className="mt-4 text-center text-gray-500">
                Showing 20 of {supplements.length} supplements
              </div>
            )}
          </div>
        )
      ) : (
        dbLoading ? (
          <div className="flex justify-center items-center h-64">
            <RefreshCw className="h-10 w-10 text-purple-500 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
              <thead className="bg-gray-100">
                <tr>
                  {dbSupplements.length > 0 &&
                    ['id', 'name', 'brand', 'category', 'price_aed', 'is_available'].map((key) => (
                      <th key={key} className="px-4 py-2 text-left text-gray-600">
                        {key}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {dbSupplements.slice(0, 20).map((supplement, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    {['id', 'name', 'brand', 'category', 'price_aed', 'is_available'].map((key) => (
                      <td key={key} className="px-4 py-2 border-t border-gray-200">
                        {typeof supplement[key] === 'boolean' 
                          ? supplement[key] ? 'Yes' : 'No'
                          : supplement[key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {dbSupplements.length > 20 && (
              <div className="mt-4 text-center text-gray-500">
                Showing 20 of {dbSupplements.length} supplements
              </div>
            )}
            {dbSupplements.length === 0 && !dbLoading && (
              <div className="text-center p-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No supplements found in the database.</p>
                <p className="text-gray-500 mt-2">Import supplements from the CSV file to populate the database.</p>
              </div>
            )}
          </div>
        )
      )}
      
      {/* Count Summary */}
      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <p className="text-blue-700">
          {supplements.length} supplements loaded from CSV.{' '}
          {dbSupplements.length} supplements found in database.
        </p>
      </div>
    </div>
  );
};

export default ImportSupplementsPage;