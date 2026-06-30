import app from './app.js';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in [${process.env.NODE_ENV || 'development'}] mode on port ${PORT}`);
});

// Handle unexpected unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`🔥 Unhandled Promise Rejection: ${err.message}`);
  // Close server and shutdown
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`🔥 Uncaught Exception: ${err.message}`);
  process.exit(1);
});
