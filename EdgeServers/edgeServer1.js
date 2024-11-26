const express = require('express');
const fs = require('fs');
const axios = require('axios');
const { getCachedContent, cacheContent, deleteCachedContent } = require('./edgeDatabase1');
const http2 = require('http2');
const path = require('path');
const app = express();
const PORT = 3004;

const serverOptions = {
  key: fs.readFileSync('C:\\Users\\shiva\\Desktop\\Fall2024\\HigherLayer\\Project\\Content_Delivery_Network\\certs\\edge-server-key.pem'),
  cert: fs.readFileSync('C:\\Users\\shiva\\Desktop\\Fall2024\\HigherLayer\\Project\\Content_Delivery_Network\\certs\\edge-server-cert.pem'),
};

// Get content with caching logic
app.get('/content/:filename', async (req, res) => {
  const filename = req.params.filename;

  try {
    const cachedContent = await getCachedContent(filename);

    if (cachedContent) {
      console.log(`[Edge Server 1] Serving cached content: ${filename}`);
      res.send(cachedContent.data);
    } else {
      const response = await axios.get(`http://localhost:3002/content/${filename}`, { responseType: 'stream' });
      response.data.pipe(res);
      
      response.data.on('end', async () => {
        console.log(`[Edge Server 1] Fetched and cached content: ${filename}`);
        await cacheContent(filename, response.data); // Cache content stream
      });
      
      response.data.on('error', (error) => {
        console.error(`[Edge Server 1] Error streaming content: ${error.message}`);
        res.status(500).send('Error streaming content');
      });
    }
  } catch (error) {
    console.error(`[Edge Server 1] Error: ${error.message}`);
    res.status(404).send('Content not found');
  }
});

// Cache Deletion
app.delete('/deleteCache/:filename', async (req, res) => {
  const filename = req.params.filename;

  try {
    // Attempt to delete cache file or data
    await deleteCachedContent(filename);
    console.log(`[Edge Server 1] Cache deleted for: ${filename}`);
    res.status(200).send(`Cache for ${filename} deleted successfully`);
  } catch (error) {
    console.error(`[Edge Server 1] Error deleting cache: ${error.message}`);
    res.status(500).send('Error deleting cache');
  }
});

// Start the server with HTTP/2
http2.createServer(serverOptions, app).listen(PORT, () => {
  console.log(`Edge Server 1 running on HTTP/2 and HTTPS at port ${PORT}`);
});
