const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3003; // Port for Proxy Server

// List of available Edge servers
const edgeServers = [
  'http://localhost:3004', // Edge Server 1
  'http://localhost:3005', // Edge Server 2
  'http://localhost:3006', // Edge Server 3
];

let requestCount = 0;

// Round-robin logic to select a Edge server
app.get('/content/:filename', async (req, res) => {
  const filename = req.params.filename;
  const edgeServer = edgeServers[requestCount % edgeServers.length];
  requestCount++;

  try {
    const response = await axios.get(`${replicaServer}/content/${filename}`);
    res.send(response.data);
  } catch (error) {
    console.log('Error fetching content from replica, fetching from origin server...');
    // Fallback to origin server if all Edges fail
    const originResponse = await axios.get(`http://localhost:3002/content/${filename}`);
    res.send(originResponse.data);
  }
});

app.listen(PORT, () => {
  console.log(`Proxy Server running on port ${PORT}`);
});
