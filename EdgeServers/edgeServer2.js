const express = require('express');
const fs = require('fs');
const axios = require('axios');
const { getCachedContent, cacheContent, deleteCachedContent } = require('./edgeDatabase2');
const http2 = require('http2');
const app = express();
const PORT = 3005;

const serverOptions = {
  key: fs.readFileSync('C:\\Users\\shiva\\Desktop\\Fall2024\\HigherLayer\\Project\\Content_Delivery_Network\\certs\\edge-server-key.pem'),
  cert: fs.readFileSync('C:\\Users\\shiva\\Desktop\\Fall2024\\HigherLayer\\Project\\Content_Delivery_Network\\certs\\edge-server-cert.pem'),
};

// Endpoint for serving cached content
app.get('/content/:filename', async (req, res) => {
  const filename = req.params.filename;

  try {
    const cachedContent = await getCachedContent(filename);

    if (cachedContent) {
      console.log(`[Edge Server 2] Serving cached content: ${filename}`);
      res.send(cachedContent.data);
    } else {
      const response = await axios.get(`http://localhost:3002/content/${filename}`, { responseType: 'stream' });
      let content = '';
      response.data.on('data', (chunk) => {
        content += chunk;
      });
      response.data.on('end', async () => {
        res.send(content);
        console.log(`[Edge Server 2] Fetched and cached content: ${filename}`);
        await cacheContent(filename, content);
      });
    }
  } catch (error) {
    console.error(`[Edge Server 2] Error: ${error.message}`);
    res.status(404).send('Content not found');
  }
});

// Endpoint for deleting cached content
app.delete('/content/:filename', async (req, res) => {
  const filename = req.params.filename;

  try {
    await deleteCachedContent(filename);
    res.status(200).send(`Deleted cached content: ${filename}`);
  } catch (error) {
    console.error(`[Edge Server 2] Error deleting cached content: ${error.message}`);
    res.status(500).send('Error deleting cached content');
  }
});

http2.createServer(serverOptions, app).listen(PORT, () => {
  console.log(`Edge Server 2 running on HTTP/2 and HTTPS at port ${PORT}`);
});
