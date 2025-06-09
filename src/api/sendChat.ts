import { supabase } from '../lib/supabaseClient';
import { logError } from '../utils/logger';

export const sendChatMessage = async (messages: any[]) => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Authentication required');
  }

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-assistant`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ messages }),
      credentials: 'include'
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Request failed with status ${res.status}`);
  }

  return await res.json();
};