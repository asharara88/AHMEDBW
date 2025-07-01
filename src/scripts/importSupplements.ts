import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { db } from '../config/database';
import { logInfo, logError } from '../utils/logger';

/**
 * Import supplements from CSV file
 */
async function importSupplements() {
  try {
    // Read CSV file
    const filePath = path.join(__dirname, '../../public/data/supplement_report_with_whey_variants.csv');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });
    
    logInfo(`Found ${records.length} supplements to import`);
    
    // Process each record
    const batch = db.batch();
    let successCount = 0;
    let errorCount = 0;
    
    for (const record of records) {
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
          key_benefits: record.key_benefits ? record.key_benefits.split(',').map((b: string) => b.trim()) : ['General Health Benefit'],
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
          tags: record.tags ? record.tags.split(',').map((t: string) => t.trim()) : [],
          seo_title: record.seo_title || record.name,
          seo_description: record.seo_description || record.description,
          created_at: new Date(),
          updated_at: new Date()
        };
        
        // Add to batch
        const docRef = db.collection('products').doc(record.id);
        batch.set(docRef, processedRecord);
        
        // Create inventory record
        const inventoryRef = db.collection('inventory').doc();
        batch.set(inventoryRef, {
          product_id: record.id,
          quantity: processedRecord.stock_quantity,
          location: 'main-warehouse',
          reorder_point: 10,
          last_restock_date: new Date(),
          created_at: new Date(),
          updated_at: new Date()
        });
        
        successCount++;
      } catch (error) {
        logError(`Error processing record: ${JSON.stringify(record)}`, error);
        errorCount++;
      }
    }
    
    // Commit batch
    await batch.commit();
    
    logInfo(`Import completed: ${successCount} supplements imported successfully, ${errorCount} errors`);
  } catch (error) {
    logError('Error importing supplements:', error);
  }
}

// Run import if this file is executed directly
if (require.main === module) {
  importSupplements()
    .then(() => {
      logInfo('Import script completed');
      process.exit(0);
    })
    .catch(error => {
      logError('Import script failed:', error);
      process.exit(1);
    });
}

export default importSupplements;