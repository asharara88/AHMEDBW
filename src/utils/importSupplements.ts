import { supabase } from '../lib/supabaseClient';
import { logError, logInfo } from './logger';
import type { Supplement } from '../types/supplements';

/**
 * Fetches and processes supplement data from a CSV file
 */
export async function importSupplementsFromCsv(csvUrl: string): Promise<Supplement[]> {
  try {
    logInfo('Fetching supplement data from CSV', { url: csvUrl });
    
    // Fetch the CSV file
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
    }
    
    const csvText = await response.text();
    
    // Parse CSV
    const supplements = parseSupplementCsv(csvText);
    logInfo(`Parsed ${supplements.length} supplements from CSV`);
    
    return supplements;
  } catch (error) {
    logError('Error importing supplements from CSV', error);
    throw error;
  }
}

/**
 * Parse CSV text into supplement objects
 */
function parseSupplementCsv(csvText: string): Supplement[] {
  // Split by lines and get headers
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(header => header.trim());
  
  // Map CSV columns to supplement properties
  const supplements: Supplement[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue; // Skip empty lines
    
    const values = parseCSVLine(lines[i]);
    if (values.length !== headers.length) {
      logError(`Line ${i} has ${values.length} values, expected ${headers.length}`, { line: lines[i] });
      continue;
    }
    
    const supplement: any = {};
    
    // Map each column to the corresponding property
    headers.forEach((header, index) => {
      let value = values[index].trim();
      
      // Handle special cases
      switch (header) {
        case 'id':
          supplement.id = value || `supp-${i}`;
          break;
        case 'name':
          supplement.name = value;
          break;
        case 'description':
          supplement.description = value;
          break;
        case 'categories':
          supplement.categories = value ? value.split(';').map(c => c.trim()) : [];
          break;
        case 'evidence_level':
          supplement.evidence_level = value || 'Yellow';
          break;
        case 'use_cases':
          supplement.use_cases = value ? value.split(';').map(c => c.trim()) : [];
          break;
        case 'stack_recommendations':
          supplement.stack_recommendations = value ? value.split(';').map(c => c.trim()) : [];
          break;
        case 'dosage':
          supplement.dosage = value;
          break;
        case 'form':
          supplement.form = value;
          break;
        case 'form_type':
          supplement.form_type = value;
          break;
        case 'brand':
          supplement.brand = value;
          break;
        case 'availability':
          supplement.availability = value.toLowerCase() === 'true';
          break;
        case 'price_aed':
          supplement.price_aed = parseFloat(value) || 0;
          break;
        case 'image_url':
          supplement.image_url = value;
          break;
        case 'benefits':
          supplement.benefits = value ? value.split(';').map(c => c.trim()) : [];
          break;
        case 'form_image_url':
          supplement.form_image_url = value;
          break;
        case 'goal':
          supplement.goal = value;
          break;
        case 'mechanism':
          supplement.mechanism = value;
          break;
        case 'evidence_summary':
          supplement.evidence_summary = value;
          break;
        case 'source_link':
          supplement.source_link = value;
          break;
        default:
          // For any other fields
          supplement[header] = value;
      }
    });
    
    // Validate required fields
    if (supplement.name && supplement.description) {
      supplements.push(supplement as Supplement);
    } else {
      logError(`Skipping supplement at line ${i} due to missing required fields`, supplement);
    }
  }
  
  return supplements;
}

/**
 * Parse a CSV line, handling quoted values correctly
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      // Toggle quote state
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current);
      current = '';
    } else {
      // Add character to current field
      current += char;
    }
  }
  
  // Add the last field
  result.push(current);
  
  return result;
}

/**
 * Upload supplements to Supabase
 */
export async function uploadSupplementsToSupabase(supplements: Supplement[]): Promise<void> {
  try {
    logInfo(`Uploading ${supplements.length} supplements to Supabase`);
    
    // Process in batches to avoid request size limits
    const batchSize = 50;
    for (let i = 0; i < supplements.length; i += batchSize) {
      const batch = supplements.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('supplements')
        .upsert(batch, { onConflict: 'id' });
      
      if (error) {
        throw error;
      }
      
      logInfo(`Uploaded batch ${i / batchSize + 1} of ${Math.ceil(supplements.length / batchSize)}`);
    }
    
    logInfo('Successfully uploaded all supplements to Supabase');
  } catch (error) {
    logError('Error uploading supplements to Supabase', error);
    throw error;
  }
}