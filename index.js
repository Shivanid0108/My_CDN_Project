const { fork } = require('child_process');
const path = require('path');

// Function to start a server
const startServer = (name, filePath) => {
    console.log(`[${name}] starting...`);
    const server = fork(filePath);  // Forking the server script as a child process

    // Event listener for when the child process exits
    server.on('exit', (code) => {
        console.error(`[${name}] exited with code ${code}`);
    });

    // Event listener for errors in the child process
    server.on('error', (err) => {
        console.error(`[${name} ERROR]`, err);
    });

    console.log(`[${name}] started`);
};

// Start the Origin Server
startServer('Origin Server', path.join(__dirname, 'Origin', 'originServer.js'));

// Start the Proxy Server
startServer('Proxy Server', path.join(__dirname, 'Proxy', 'proxyServer.js'));

// Start Edge Servers
startServer('Edge Server 1', path.join(__dirname, 'EdgeServers', 'edgeServer1.js'));
startServer('Edge Server 2', path.join(__dirname, 'EdgeServers', 'edgeServer2.js'));
startServer('Edge Server 3', path.join(__dirname, 'EdgeServers', 'edgeServer3.js'));

process.on('SIGINT', () => {
  console.log('Shutting down all servers...');
  process.exit();
});