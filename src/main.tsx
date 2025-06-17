import { StrictMode, useEffect } from 'react';
import { createRoot, Root } from 'react-dom/client';
import App from './App';
import './index.css';
import { AppProviders } from './components/providers/AppProviders';
import { useAccessibilityMonitoring } from './hooks/useAccessibilityMonitoring';
import { checkSupabaseConnection } from './utils/supabaseConnection';
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
        await checkSupabaseConnection();
      } catch (error) {
        logError('Failed to initialize app', error);
      }
    };
    
    initializeApp();
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
    logInfo('Initializing application in development mode');
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
        <div style="padding: 20px; text-align: center;">
          <h2>Something went wrong</h2>
          <p>We're having trouble loading the application. Please try refreshing the page.</p>
        </div>
      `;
    }
  }
}

// Initialize the application
initializeApp();