import app from './app';
import dotenv from 'dotenv';
import { logInfo, logError } from './utils/logger';

// Load environment variables
dotenv.config();

// Set port
const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
  logInfo(`Server running on port ${PORT}`);
  logInfo(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logInfo(`API Version: ${process.env.API_VERSION || '1.0.0'}`);
  logInfo(`API Documentation: http://localhost:${PORT}/api-docs`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logError('Unhandled Rejection', err);
  // In production, you might want to exit the process
  // process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logError('Uncaught Exception', err);
  // In production, you might want to exit the process
  // process.exit(1);
});