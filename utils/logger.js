function logRequest(req) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  
  function logError(message, error) {
    console.error(`[${new Date().toISOString()}] ERROR: ${message}`, error);
  }
  
  module.exports = { logRequest, logError };
  