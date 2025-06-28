import { createClient } from '@supabase/supabase-js';
import { supplements } from '../src/data/supplements';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadSupplements() {
  const { data, error } = await supabase.from('supplements').insert(supplements);
  if (error) {
    console.error('Error inserting data:', error);
  } else {
    console.log('Supplements data uploaded:', data);
  }
}

uploadSupplements();
