'use strict';

require('dotenv').config();

// Initialise DB connection pool (validates credentials on startup)
require('./src/config/db');

const app  = require('./src/app');
const PORT = parseInt(process.env.PORT || '3000', 10);

const server = app.listen(PORT, () => {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log(`║  🚀  E-Learning API is running                    ║`);
  console.log(`║  📡  Server  : http://localhost:${PORT}               ║`);
  console.log(`║  📄  Swagger : http://localhost:${PORT}/api/docs       ║`);
  console.log(`║  ❤️   Health  : http://localhost:${PORT}/health         ║`);
  console.log('╚═══════════════════════════════════════════════════╝');
  console.log('');
});

// ── Graceful Shutdown ────────────────────────────────────────────────────────
const gracefulShutdown = (signal) => {
  console.log(`\n⚠️  Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('✅  HTTP server closed.');
    process.exit(0);
  });
  // Force kill after 10 seconds
  setTimeout(() => {
    console.error('❌  Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT',  () => gracefulShutdown('SIGINT'));

// ── Unhandled Rejections ─────────────────────────────────────────────────────
process.on('unhandledRejection', (reason) => {
  console.error('❌  Unhandled Promise Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('❌  Uncaught Exception:', err);
  process.exit(1);
});
