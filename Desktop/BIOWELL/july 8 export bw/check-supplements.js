import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkSupplements() {
  console.log('🔍 CHECKING SUPPLEMENT INVENTORY');
  console.log('=================================');
  
  try {
    // Check total count
    const { data, error } = await supabase
      .from('supplements')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Database error:', error);
      return;
    }
    
    console.log(`📊 Found ${data.length} supplements (showing first 5)`);
    
    if (data.length === 0) {
      console.log('⚠️  NO SUPPLEMENTS FOUND - IMPORT NEEDED');
      console.log('👉 Go to: http://localhost:5173/admin/import-supplements');
    } else {
      console.log('✅ Supplements found:');
      data.forEach((supplement, index) => {
        console.log(`${index + 1}. ${supplement.name} - ${supplement.price_aed} AED`);
      });
    }
    
  } catch (err) {
    console.error('💥 Error:', err);
  }
}

checkSupplements();
