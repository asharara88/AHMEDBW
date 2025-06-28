import { importSupplementsFromCsv, uploadSupplementsToSupabase } from '../utils/importSupplements';

// CSV URL from the command line argument or use default
const csvUrl = process.argv[2] || 'https://leznzqfezoofngumpiqf.supabase.co/storage/v1/object/sign/supplementsdemo/Supplement%20Demo%20DB/supplements_final_db_ready.csv?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82ZjcyOGVhMS1jMTdjLTQ2MTYtOWFlYS1mZmI3MmEyM2U5Y2EiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzdXBwbGVtZW50c2RlbW8vU3VwcGxlbWVudCBEZW1vIERCL3N1cHBsZW1lbnRzX2ZpbmFsX2RiX3JlYWR5LmNzdiIsImlhdCI6MTc1MTA4ODU4MSwiZXhwIjoxODc3MjMyNTgxfQ.bx0eYp4ONd2ROc2RJbcUTcV05bDS6oRTNyusfgRDRqE';

async function importSupplements() {
  try {
    console.log(`Importing supplements from ${csvUrl}`);
    
    // Fetch and parse the CSV
    const supplements = await importSupplementsFromCsv(csvUrl);
    console.log(`Parsed ${supplements.length} supplements from CSV`);
    
    // Upload to Supabase
    await uploadSupplementsToSupabase(supplements);
    console.log('Successfully uploaded supplements to Supabase');
    
    process.exit(0);
  } catch (error) {
    console.error('Error importing supplements:', error);
    process.exit(1);
  }
}

// Run the import
importSupplements();