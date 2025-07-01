import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { supabase } from '../lib/supabaseClient';
import { logInfo, logError } from '../utils/logger';

interface SupplementRecord {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory?: string;
  description: string;
  detailed_description?: string;
  key_benefits?: string;
  ingredients?: string;
  serving_size?: string;
  servings_per_container?: string;
  directions_for_use?: string;
  warnings?: string;
  price?: string;
  compare_at_price?: string;
  currency?: string;
  stock_quantity?: string;
  is_available?: string;
  is_featured?: string;
  is_bestseller?: string;
  image_url?: string;
  nutrition_facts?: string;
  certifications?: string;
  target_audience?: string;
  health_conditions?: string;
  allergen_info?: string;
  manufacturer?: string;
  country_of_origin?: string;
  expiry_date?: string;
  barcode?: string;
  sku?: string;
  weight_grams?: string;
  tags?: string;
  seo_title?: string;
  seo_description?: string;
  price_aed?: string;
  form_type?: string;
  form_image_url?: string;
  goal?: string;
  mechanism?: string;
  evidence_summary?: string;
  source_link?: string;
}

/**
 * Import supplements from CSV file to Supabase
 */
async function importSupplementsFromCsv() {
  try {
    // Read CSV file
    const filePath = path.join(process.cwd(), 'public/data/supplement_report_with_whey_variants.csv');
    logInfo(`Reading CSV file from: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
      logError(`CSV file not found at: ${filePath}`);
      return;
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    }) as SupplementRecord[];
    
    logInfo(`Found ${records.length} supplements to import`);
    
    // Process records in batches to avoid rate limits
    const batchSize = 20;
    const batches = [];
    
    for (let i = 0; i < records.length; i += batchSize) {
      batches.push(records.slice(i, i + batchSize));
    }
    
    logInfo(`Split into ${batches.length} batches of ${batchSize} records`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Process each batch
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      logInfo(`Processing batch ${batchIndex + 1} of ${batches.length}`);
      
      // Process each record in the batch
      for (const record of batch) {
        try {
          // Skip records with missing required fields
          if (!record.id || !record.name || !record.brand || !record.category) {
            logError(`Skipping record due to missing required fields: ${JSON.stringify(record)}`);
            errorCount++;
            continue;
          }
          
          // Convert string fields to appropriate types
          const processedRecord = {
            id: record.id,
            name: record.name,
            brand: record.brand,
            category: record.category,
            subcategory: record.subcategory || null,
            description: record.description || '',
            detailed_description: record.detailed_description || '',
            key_benefits: record.key_benefits ? record.key_benefits.split(',').map(b => b.trim()) : ['General Health Benefit'],
            ingredients: record.ingredients || '',
            serving_size: record.serving_size || '',
            servings_per_container: record.servings_per_container ? Number(record.servings_per_container) : null,
            directions_for_use: record.directions_for_use || '',
            warnings: record.warnings || '',
            price: record.price_aed ? Number(record.price_aed) : (record.price ? Number(record.price) : 0),
            compare_at_price: record.compare_at_price ? Number(record.compare_at_price) : null,
            currency: record.currency || 'USD',
            stock_quantity: record.stock_quantity ? Number(record.stock_quantity) : 100,
            is_available: record.is_available === 'True' || record.is_available === 'true' || record.is_available === true,
            is_featured: record.is_featured === 'True' || record.is_featured === 'true' || record.is_featured === true,
            is_bestseller: record.is_bestseller === 'True' || record.is_bestseller === 'true' || record.is_bestseller === true,
            image_url: record.image_url || null,
            nutrition_facts: record.nutrition_facts ? JSON.parse(record.nutrition_facts) : {},
            certifications: record.certifications || '',
            target_audience: record.target_audience || '',
            health_conditions: record.health_conditions || '',
            allergen_info: record.allergen_info || '',
            manufacturer: record.manufacturer || record.brand,
            country_of_origin: record.country_of_origin || '',
            expiry_date: record.expiry_date || '',
            barcode: record.barcode || '',
            sku: record.sku || '',
            weight_grams: record.weight_grams ? Number(record.weight_grams) : null,
            tags: record.tags ? record.tags.split(',').map(t => t.trim()) : [],
            seo_title: record.seo_title || record.name,
            seo_description: record.seo_description || record.description,
            price_aed: record.price_aed ? Number(record.price_aed) : null,
            form_type: record.form_type || null,
            form_image_url: record.form_image_url || null,
            goal: record.goal || null,
            mechanism: record.mechanism || null,
            evidence_summary: record.evidence_summary || null,
            source_link: record.source_link || null
          };
          
          // Insert or update record in Supabase
          const { error } = await supabase
            .from('supplement')
            .upsert(processedRecord, {
              onConflict: 'id'
            });
          
          if (error) {
            throw error;
          }
          
          successCount++;
          
          // Log progress every 10 records
          if (successCount % 10 === 0) {
            logInfo(`Progress: ${successCount} records processed successfully`);
          }
        } catch (error) {
          logError(`Error processing record: ${JSON.stringify(record)}`, error);
          errorCount++;
        }
      }
      
      // Add a small delay between batches to avoid rate limits
      if (batchIndex < batches.length - 1) {
        logInfo(`Waiting before processing next batch...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    logInfo(`Import completed: ${successCount} supplements imported successfully, ${errorCount} errors`);
  } catch (error) {
    logError('Error importing supplements:', error);
  }
}

// Run import if this file is executed directly
if (import.meta.url === import.meta.resolve(process.argv[1])) {
  importSupplementsFromCsv()
    .then(() => {
      logInfo('Import script completed');
      process.exit(0);
    })
    .catch(error => {
      logError('Import script failed:', error);
      process.exit(1);
    });
}

export default importSupplementsFromCsv;