import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSupplementsCSV, transformSupplementsForDB, importSupplementsToDB } from '../../utils/importSupplements';
import { AlertCircle, Check, Download, Upload, RefreshCw } from 'lucide-react';
import type { SupplementCSV, SupplementForDB } from '../../utils/importSupplements';

const CSV_URL = "https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/supplementsdemo/Supplement%20Demo%20DB/supplements_final_db_ready.csv?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82ZjcyOGVhMS1jMTdjLTQ2MTYtOWFlYS1mZmI3MmEyM2U5Y2EiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzdXBwbGVtZW50c2RlbW8vU3VwcGxlbWVudCBEZW1vIERCL3N1cHBsZW1lbnRzX2ZpbmFsX2RiX3JlYWR5LmNzdiIsImlhdCI6MTc1MTA4ODU4MSwiZXhwIjoxODc3MjMyNTgxfQ.bx0eYp4ONd2ROc2RJbcUTcV05bDS6oRTNyusfgRDRqE";

const ImportSupplementsPage = () => {
  const [supplements, setSupplements] = useState<SupplementCSV[]>([]);
  const [transformedSupplements, setTransformedSupplements] = useState<SupplementForDB[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<'raw' | 'transformed'>('raw');
  
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchSupplementData();
  }, []);
  
  const fetchSupplementData = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const data = await fetchSupplementsCSV(CSV_URL);
      setSupplements(data);
      
      const transformed = transformSupplementsForDB(data);
      setTransformedSupplements(transformed);
      
      setSuccess(`Successfully loaded ${data.length} supplements from CSV`);
    } catch (err) {
      setError(`Error loading supplement data: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleImport = async () => {
    if (transformedSupplements.length === 0) {
      setError('No supplements to import');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await importSupplementsToDB(transformedSupplements);
      
      if (result.success) {
        setSuccess(result.message);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(`Error importing supplements: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Import Supplements</h1>
      
      {/* Action Buttons */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={fetchSupplementData}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
          {loading ? 'Loading...' : 'Refresh Data'}
        </button>
        
        <button
          onClick={handleImport}
          disabled={loading || transformedSupplements.length === 0}
          className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
          {loading ? 'Importing...' : 'Import to Database'}
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
              onClick={() => setCurrentTab('raw')}
              className={`inline-flex items-center p-4 border-b-2 rounded-t-lg group ${
                currentTab === 'raw'
                  ? 'text-blue-600 border-blue-600'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
            >
              Raw CSV Data
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setCurrentTab('transformed')}
              className={`inline-flex items-center p-4 border-b-2 rounded-t-lg group ${
                currentTab === 'transformed'
                  ? 'text-blue-600 border-blue-600'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
            >
              Transformed Data
            </button>
          </li>
        </ul>
      </div>
      
      {/* Data Display */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="h-10 w-10 text-blue-500 animate-spin" />
        </div>
      ) : (
        currentTab === 'raw' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
              <thead className="bg-gray-100">
                <tr>
                  {supplements.length > 0 &&
                    Object.keys(supplements[0]).map((key) => (
                      <th key={key} className="px-4 py-2 text-left text-gray-600">
                        {key}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {supplements.map((supplement, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    {Object.values(supplement).map((value, valueIndex) => (
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
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
              <thead className="bg-gray-100">
                <tr>
                  {transformedSupplements.length > 0 &&
                    Object.keys(transformedSupplements[0]).map((key) => (
                      <th key={key} className="px-4 py-2 text-left text-gray-600">
                        {key}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {transformedSupplements.map((supplement, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    {Object.entries(supplement).map(([key, value], valueIndex) => (
                      <td key={valueIndex} className="px-4 py-2 border-t border-gray-200">
                        {Array.isArray(value)
                          ? value.join(', ')
                          : typeof value === 'string' && value.length > 100
                          ? `${value.substring(0, 100)}...`
                          : String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
      
      {/* Count Summary */}
      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <p className="text-blue-700">
          {supplements.length} supplements loaded from CSV.{' '}
          {transformedSupplements.length} transformed for database.
        </p>
      </div>
    </div>
  );
};

export default ImportSupplementsPage;