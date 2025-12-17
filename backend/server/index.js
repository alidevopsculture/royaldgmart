require("dotenv").config();
const cors = require("cors");
const http = require("http");
const app = require('./app');
const server = http.createServer(app);

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Backend Server listening on ${port}`);
});