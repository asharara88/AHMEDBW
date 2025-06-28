import { StrictMode, useEffect } from 'react';
import { createRoot, Root } from 'react-dom/client';
import App from './App';
import './index.css';
import { AppProviders } from './components/providers/AppProviders';
import { useAccessibilityMonitoring } from './hooks/useAccessibilityMonitoring';
import { checkSupabaseConnection, onConnectionError } from './utils/supabaseConnection';
import { logError, logInfo } from './utils/logger';
import { isDevelopment } from './utils/environment';

/**
 * AppWrapper component that includes global hooks and initialization
 */
function AppWrapper() {
  // Use the accessibility monitoring hook in development
  useAccessibilityMonitoring();
  
  // Check Supabase connection on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        logInfo('Starting application initialization...');
        
        // Check environment variables first
        const hasRequiredEnvVars = !!(
          import.meta.env.VITE_SUPABASE_URL && 
          import.meta.env.VITE_SUPABASE_ANON_KEY
        );
        
        if (!hasRequiredEnvVars) {
          logError('Missing required environment variables', {
            hasUrl: !!import.meta.env.VITE_SUPABASE_URL,
            hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
            instruction: 'Please create a .env file with your Supabase credentials'
          });
          
          // Show user-friendly error in development
          if (isDevelopment()) {
            console.error(`
🚨 Configuration Error 🚨

Missing Supabase environment variables!

To fix this:
1. Create a .env file in your project root
2. Copy the contents of .env.example
3. Replace the placeholder values with your actual Supabase credentials:
   - VITE_SUPABASE_URL=https://your-project.supabase.co
   - VITE_SUPABASE_ANON_KEY=your-anon-key
4. Get these values from: https://supabase.com/dashboard/project/your-project/settings/api
5. Restart your development server

Current status:
- VITE_SUPABASE_URL: ${import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing'}
- VITE_SUPABASE_ANON_KEY: ${import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}
            `);
          }
          return;
        }
        
        // Try to connect to Supabase, but continue even if it fails
        // The app will work in a degraded/demo mode if connection fails
        const isConnected = await checkSupabaseConnection();
        
        if (isConnected) {
          logInfo('Application initialized successfully with Supabase connection');
        } else {
          logInfo('Application initialized in offline mode - some features may be limited');
        }
      } catch (error) {
        logError('Failed to initialize app', error);
        
        // In development, show more helpful error information
        if (isDevelopment()) {
          console.error('Application initialization failed:', error);
        }
      }
    };
    
    // Set up connection error handler
    const removeErrorListener = onConnectionError((event) => {
      if (isDevelopment()) {
        console.error('🔌 Supabase Connection Error:', event.detail);
        
        if (event.detail.troubleshooting) {
          console.log('🔧 Troubleshooting steps:');
          event.detail.troubleshooting.forEach((step: string, index: number) => {
            console.log(`  ${index + 1}. ${step}`);
          });
        }
      }
    });
    
    initializeApp();
    
    // Cleanup
    return () => {
      removeErrorListener();
    };
  }, []);
  
  return (
    <AppProviders>
      <App />
    </AppProviders>
  );
}

/**
 * Initialize the application
 */
function initializeApp() {
  // Find the root element
  const rootElement = document.getElementById('root');
  
  // Throw a descriptive error if the root element is missing
  if (!rootElement) {
    throw new Error(
      'Root element with id "root" not found. Please check your HTML file.'
    );
  }
  
  // Log initialization in development mode
  if (isDevelopment()) {
    logInfo('Initializing Biowell application in development mode');
    console.log('🏥 Biowell - Digital Health Coach');
    console.log('📊 Environment:', {
      mode: import.meta.env.MODE,
      dev: import.meta.env.DEV,
      prod: import.meta.env.PROD
    });
  }
  
  // Create root and render app
  let root: Root;
  try {
    root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <AppWrapper />
      </StrictMode>
    );
  } catch (error) {
    logError('Failed to render application', error);
    
    // Show a user-friendly error message
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 40px; text-align: center; font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626; margin-bottom: 16px;">⚠️ Application Error</h2>
          <p style="margin-bottom: 20px; color: #374151;">
            We're having trouble loading the Biowell application. This is likely a configuration issue.
          </p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: left; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1f2937;">Common fixes:</h3>
            <ol style="color: #374151; padding-left: 20px;">
              <li>Create a <code>.env</code> file in your project root</li>
              <li>Copy settings from <code>.env.example</code></li>
              <li>Add your Supabase project URL and anonymous key</li>
              <li>Restart your development server</li>
            </ol>
          </div>
          <button 
            onclick="window.location.reload()" 
            style="background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 14px;"
          >
            🔄 Reload Page
          </button>
          <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
            Check the browser console for detailed error information.
          </p>
        </div>
      `;
    }
  }
}

// Initialize the application
initializeApp();