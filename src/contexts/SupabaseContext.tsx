import { createContext, useContext, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { SupabaseClient } from '@supabase/supabase-js';

type SupabaseContextType = {
  supabase: SupabaseClient;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  // Use the singleton supabase instance from supabaseClient.ts
  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
}