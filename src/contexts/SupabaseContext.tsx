import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, checkSupabaseConnection } from '../lib/supabaseClient';
import type { SupabaseClient } from '@supabase/supabase-js';
import { useError } from './ErrorContext';
import { ErrorCode, createErrorObject } from '../utils/errorHandling';

type SupabaseContextType = {
  supabase: SupabaseClient;
  isInitialized: boolean;
  connectionError: string | null;
  isInitialized: boolean;
  connectionError: string | null;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

    const verifyConnection = async () => {
      const { success, error } = await checkSupabaseConnection();
      
      if (!success) {
        console.error('Failed to initialize Supabase client:', error);
        setConnectionError(error as string);
        
        // Add to global error context
        addError(createErrorObject(
          'Unable to connect to the database. Some features may not work properly.',
          'error',
          ErrorCode.API_REQUEST_FAILED,
          'supabase'
        ));
      } else {
        setIsInitialized(true);
      }
    };
    
    verifyConnection();
  }, [addError]);

  return (
    <SupabaseContext.Provider value={{ 
      supabase,
      isInitialized,
      supabase,
      isInitialized,
      connectionError
    }}>
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