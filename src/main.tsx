import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { checkSupabaseConnection, onConnectionError } from './utils/supabaseConnection';
import { logError, logInfo } from './utils/logger';

// Initialize the application with proper error handling
async function initializeApp() {
  try {
    logInfo('Starting application initialization...');
    
    // Check Supabase connection with timeout
    const connectionPromise = checkSupabaseConnection();
    const timeoutPromise = new Promise<boolean>((resolve) => {
      setTimeout(() => {
        logInfo('Connection check timed out, proceeding with app initialization');
        resolve(false);
      }, 15000); // 15 second timeout for initialization
    });
    
    // Race between connection check and timeout
    const isConnected = await Promise.race([connectionPromise, timeoutPromise]);
    
    if (isConnected) {
      logInfo('Supabase connection successful, starting app...');
    } else {
      logInfo('Supabase connection failed or timed out, starting app in offline mode...');
    }
    
    // Set up connection error listener
    const removeErrorListener = onConnectionError((event) => {
      console.warn('Supabase connection error:', event.detail);
      // You could show a toast notification here
    });
    
    // Render the app regardless of connection status
    const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    logInfo('Application initialized successfully');
    
    // Clean up error listener when the app unmounts (optional)
    window.addEventListener('beforeunload', removeErrorListener);
    
  } catch (error) {
    logError('Failed to initialize application', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Still try to render the app even if initialization fails
    try {
      const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
      logInfo('Application rendered despite initialization errors');
    } catch (renderError) {
      logError('Critical error: Failed to render application', {
        error: renderError instanceof Error ? renderError.message : String(renderError)
      });
      
      // Last resort: show a basic error message
      const rootElement = document.getElementById('root');
      if (rootElement) {
        rootElement.innerHTML = `
          <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
            <h1>Application Error</h1>
            <p>Sorry, there was an error loading the application.</p>
            <p>Please check your internet connection and try refreshing the page.</p>
            <button onclick="window.location.reload()" style="padding: 10px 20px; margin-top: 10px;">
              Refresh Page
            </button>
          </div>
        `;
      }
    }
  }
}

// Start the application
initializeApp();