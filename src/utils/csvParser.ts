import Papa from 'papaparse';

/**
 * Parse CSV string to array of objects
 * @param csvString CSV string to parse
 * @returns Array of objects representing CSV rows
 */
export function parseCSV<T>(csvString: string): T[] {
  const result = Papa.parse(csvString, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
    transform: (value) => value.trim()
  });
  
  if (result.errors && result.errors.length > 0) {
    console.error('CSV parsing errors:', result.errors);
  }
  
  return result.data as T[];
}

/**
 * Convert array of objects to CSV string
 * @param data Array of objects to convert
 * @returns CSV string
 */
export function toCSV<T>(data: T[]): string {
  return Papa.unparse(data);
}

/**
 * Clean CSV data by removing empty rows and trimming values
 * @param data Array of objects to clean
 * @returns Cleaned array of objects
 */
export function cleanCSVData<T>(data: T[]): T[] {
  return data.filter(row => {
    // Check if row has at least one non-empty value
    return Object.values(row).some(value => 
      value !== null && value !== undefined && String(value).trim() !== ''
    );
  }).map(row => {
    const cleanedRow: any = {};
    
    // Trim string values
    Object.entries(row).forEach(([key, value]) => {
      if (typeof value === 'string') {
        cleanedRow[key] = value.trim();
      } else {
        cleanedRow[key] = value;
      }
    });
    
    return cleanedRow as T;
  });
}