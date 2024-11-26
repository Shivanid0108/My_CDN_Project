let requestCount = 0;

/**
 * Returns the next server in a round-robin sequence.
 * @param {Array<string>} servers - List of server URLs.
 * @returns {string} The selected server URL.
 */
function getNextServer(servers) {
  const server = servers[requestCount % servers.length];
  requestCount++;
  return server;
}

module.exports = { getNextServer };
