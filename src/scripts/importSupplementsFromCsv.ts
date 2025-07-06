import { supabase } from '../lib/supabaseClient';
import { logError, logInfo } from '../utils/logger';
import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';

interface SupplementCSV {
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
  price_aed?: string;
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
  form_type?: string;
}

interface SupplementForDB {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory?: string;
  description: string;
  detailed_description?: string;
  key_benefits?: string[];
  ingredients?: string;
  serving_size?: string;
  servings_per_container?: number;
  directions_for_use?: string;
  warnings?: string;
  price?: number;
  price_aed?: number;
  compare_at_price?: number;
  currency?: string;
  stock_quantity?: number;
  is_available?: boolean;
  is_featured?: boolean;
  is_bestseller?: boolean;
  image_url?: string;
  nutrition_facts?: any;
  certifications?: string;
  target_audience?: string;
  health_conditions?: string;
  allergen_info?: string;
  manufacturer?: string;
  country_of_origin?: string;
  expiry_date?: string;
  barcode?: string;
  sku?: string;
  weight_grams?: number;
  tags?: string[];
  seo_title?: string;
  seo_description?: string;
  form_type?: string;
}

async function importSupplementsFromCsv() {
  try {
    // Read the CSV file
    const filePath = path.join(process.cwd(), 'public/data/supplement_report_with_whey_variants.csv');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Parse CSV
    const { data, errors } = Papa.parse<SupplementCSV>(fileContent, {
      header: true,
      skipEmptyLines: true,
    });
    
    if (errors.length > 0) {
      console.error('CSV parsing errors:', errors);
    }
    
    logInfo(`Found ${data.length} supplements in CSV file`);
    
    // Transform data for database
    const supplements: SupplementForDB[] = data.map(item => {
      // Parse benefits into an array
      const benefits = item.key_benefits 
        ? item.key_benefits.split(',').map(b => b.trim()).filter(Boolean)
        : ['General Health Benefit'];
      
      // Parse tags into an array
      const tags = item.tags
        ? item.tags.split(',').map(t => t.trim()).filter(Boolean)
        : [];
      
      // Parse nutrition facts
      let nutritionFacts = {};
      if (item.nutrition_facts) {
        try {
          nutritionFacts = JSON.parse(item.nutrition_facts);
        } catch (e) {
          // If not valid JSON, use empty object
          nutritionFacts = {};
        }
      }
      
      // Determine form type
      let formType = item.form_type || 'capsule';
      if (item.name.toLowerCase().includes('powder')) {
        formType = 'powder';
      } else if (item.name.toLowerCase().includes('liquid')) {
        formType = 'liquid';
      } else if (item.name.toLowerCase().includes('tablet')) {
        formType = 'tablet';
      } else if (item.name.toLowerCase().includes('softgel')) {
        formType = 'softgel';
      } else if (item.name.toLowerCase().includes('gummy')) {
        formType = 'gummy';
      }
      
      // Fix category for weight loss items
      let category = item.category;
      if (category.startsWith('8')) {
        category = 'Weight Loss';
      }
      
      return {
        id: item.id,
        name: item.name,
        brand: item.brand,
        category: category,
        subcategory: item.subcategory || null,
        description: item.description || '',
        detailed_description: item.detailed_description || '',
        key_benefits: benefits,
        ingredients: item.ingredients || '',
        serving_size: item.serving_size || '',
        servings_per_container: item.servings_per_container ? Number(item.servings_per_container) : null,
        directions_for_use: item.directions_for_use || '',
        warnings: item.warnings || '',
        price: item.price ? Number(item.price) : 0,
        price_aed: item.price_aed ? Number(item.price_aed) : 0,
        compare_at_price: item.compare_at_price ? Number(item.compare_at_price) : null,
        currency: item.currency || 'USD',
        stock_quantity: item.stock_quantity ? Number(item.stock_quantity) : 100,
        is_available: item.is_available === 'True' || item.is_available === 'true' || true,
        is_featured: item.is_featured === 'True' || item.is_featured === 'true' || false,
        is_bestseller: item.is_bestseller === 'True' || item.is_bestseller === 'true' || false,
        image_url: item.image_url || 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg',
        nutrition_facts: nutritionFacts,
        certifications: item.certifications || '',
        target_audience: item.target_audience || '',
        health_conditions: item.health_conditions || '',
        allergen_info: item.allergen_info || '',
        manufacturer: item.manufacturer || item.brand,
        country_of_origin: item.country_of_origin || '',
        expiry_date: item.expiry_date || '',
        barcode: item.barcode || '',
        sku: item.sku || '',
        weight_grams: item.weight_grams ? Number(item.weight_grams) : null,
        tags: tags,
        seo_title: item.seo_title || item.name,
        seo_description: item.seo_description || item.description,
        form_type: formType
      };
    });
    
    // First make sure the supplement_forms table is populated
    const formTypes = [...new Set(supplements.map(s => s.form_type).filter(Boolean))];
    for (const formType of formTypes) {
      if (!formType) continue;
      
      // Check if form type exists
      const { data: existingForm, error: formError } = await supabase
        .from('supplement_forms')
        .select('form_type')
        .eq('form_type', formType)
        .maybeSingle();
      
      // If form doesn't exist, add it
      if (!existingForm && formType) {
        await supabase
          .from('supplement_forms')
          .insert({
            form_type: formType,
            image_url: 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg',
            used_for: 'Various supplements',
            name: formType.charAt(0).toUpperCase() + formType.slice(1)
          });
        
        logInfo(`Created supplement form: ${formType}`);
      }
    }
    
    // Insert supplements in batches to avoid hitting API limits
    const BATCH_SIZE = 20;
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < supplements.length; i += BATCH_SIZE) {
      const batch = supplements.slice(i, i + BATCH_SIZE);
      
      const { data, error } = await supabase
        .from('supplements')
        .upsert(batch, {
          onConflict: 'id',
          ignoreDuplicates: false
        });
      
      if (error) {
        logError(`Error inserting batch ${i / BATCH_SIZE + 1}:`, error);
        errorCount += batch.length;
      } else {
        logInfo(`Successfully inserted batch ${i / BATCH_SIZE + 1} (${batch.length} supplements)`);
        successCount += batch.length;
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    logInfo(`Import completed: ${successCount} supplements imported successfully, ${errorCount} errors`);
    
    return {
      success: true,
      message: `Successfully imported ${successCount} supplements`,
      errors: errorCount
    };
  } catch (error) {
    logError('Error importing supplements:', error);
    return {
      success: false,
      message: 'Failed to import supplements',
      error
    };
  }
}

export default importSupplementsFromCsv;