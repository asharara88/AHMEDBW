import { importSupplementsFromCSV } from '../utils/importSupplements';
import { logInfo, logError } from '../utils/logger';

// URL of the supplements CSV file
const CSV_URL = "https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/supplementsdemo/Supplement%20Demo%20DB/supplements_final_db_ready.csv?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82ZjcyOGVhMS1jMTdjLTQ2MTYtOWFlYS1mZmI3MmEyM2U5Y2EiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzdXBwbGVtZW50c2RlbW8vU3VwcGxlbWVudCBEZW1vIERCL3N1cHBsZW1lbnRzX2ZpbmFsX2RiX3JlYWR5LmNzdiIsImlhdCI6MTc1MTA4ODU4MSwiZXhwIjoxODc3MjMyNTgxfQ.bx0eYp4ONd2ROc2RJbcUTcV05bDS6oRTNyusfgRDRqE";

async function main() {
  console.log('Starting supplement import...');
  
  try {
    const result = await importSupplementsFromCSV(CSV_URL);
    
    if (result.success) {
      logInfo('Import successful:', result.message);
      console.log('\x1b[32m%s\x1b[0m', '✓ Import successful!'); // Green text
      console.log(result.message);
    } else {
      logError('Import failed:', result.error);
      console.error('\x1b[31m%s\x1b[0m', '✗ Import failed!'); // Red text
      console.error(result.message);
    }
  } catch (error) {
    logError('Unhandled error during import:', error);
    console.error('\x1b[31m%s\x1b[0m', '✗ Unhandled error during import!'); // Red text
    console.error(error);
  }
}

main();