import { supabase } from '../lib/supabaseClient';
import { logError, logInfo } from '../utils/logger';
import Papa from 'papaparse';

export interface SupplementCSV {
  name: string;
  description: string;
  form_type: string;
  price: string;
  image_url: string;
  dosage: string;
  benefits: string;
  goal: string;
  mechanism: string;
  evidence_level: string;
  evidence_summary: string;
  source_link: string;
}

export interface SupplementForDB {
  name: string;
  description: string;
  form_type: string;
  price_aed: number;
  image_url: string;
  dosage: string;
  benefits: string[];
  goal: string;
  mechanism: string;
  evidence_level: string;
  evidence_summary: string;
  source_link: string;
  is_active: boolean;
}

/**
 * Fetches and parses a CSV file containing supplement data
 */
export async function fetchSupplementsCSV(url: string): Promise<SupplementCSV[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
    }
    
    const csvText = await response.text();
    const parsedResult = Papa.parse<SupplementCSV>(csvText, {
      header: true,
      skipEmptyLines: true,
    });
    
    if (parsedResult.errors.length > 0) {
      console.error('CSV parsing errors:', parsedResult.errors);
    }
    
    return parsedResult.data;
  } catch (error) {
    logError('Error fetching supplements CSV:', error);
    throw error;
  }
}

/**
 * Transforms CSV data into the format expected by the database
 */
export function transformSupplementsForDB(supplements: SupplementCSV[]): SupplementForDB[] {
  return supplements.map(supplement => {
    // Parse benefits into an array
    const benefits = supplement.benefits
      .split(',')
      .map(b => b.trim())
      .filter(Boolean);
    
    // Parse price to number
    const price = parseFloat(supplement.price) || 0;
    
    return {
      name: supplement.name,
      description: supplement.description,
      form_type: supplement.form_type,
      price_aed: price,
      image_url: supplement.image_url,
      dosage: supplement.dosage,
      benefits,
      goal: supplement.goal,
      mechanism: supplement.mechanism,
      evidence_level: supplement.evidence_level,
      evidence_summary: supplement.evidence_summary,
      source_link: supplement.source_link,
      is_active: true
    };
  });
}

/**
 * Imports supplement data into Supabase
 */
export async function importSupplementsToDB(supplements: SupplementForDB[]): Promise<{
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}> {
  try {
    // First make sure the supplement_forms table is populated
    const formTypes = [...new Set(supplements.map(s => s.form_type))];
    for (const formType of formTypes) {
      // Only insert if not already in the database
      const { error: formError } = await supabase
        .from('supplement_forms')
        .select('form_type')
        .eq('form_type', formType)
        .maybeSingle();
        
      // If the form doesn't exist, add a placeholder
      if (formError) {
        await supabase
          .from('supplement_forms')
          .insert({
            form_type: formType,
            image_url: 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg',
            used_for: 'Various supplements'
          })
          .select();
      }
    }
    
    // Then insert the supplements
    const { data, error } = await supabase
      .from('supplements')
      .upsert(supplements, {
        onConflict: 'name', // Assuming name is unique
        ignoreDuplicates: false
      })
      .select();
      
    if (error) {
      logError('Error importing supplements to DB:', error);
      return {
        success: false,
        message: `Import failed: ${error.message}`,
        error
      };
    }
    
    logInfo(`Successfully imported ${data.length} supplements`);
    return {
      success: true,
      message: `Successfully imported ${data.length} supplements`,
      data
    };
  } catch (error) {
    logError('Unexpected error importing supplements:', error);
    return {
      success: false,
      message: 'An unexpected error occurred during import',
      error
    };
  }
}

/**
 * Full process to fetch, transform and import supplements
 */
export async function importSupplementsFromCSV(csvUrl: string): Promise<{
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}> {
  try {
    // Fetch and parse the CSV
    const csvData = await fetchSupplementsCSV(csvUrl);
    
    // Transform data for database
    const dbData = transformSupplementsForDB(csvData);
    
    // Import to database
    return await importSupplementsToDB(dbData);
  } catch (error) {
    logError('Error in supplement import process:', error);
    return {
      success: false,
      message: 'Failed to import supplements',
      error
    };
  }
}