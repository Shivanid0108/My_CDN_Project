const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');
const axios = require('axios');
const fs = require('fs');
const app = express();
const PORT = 3006; // Port for Edge Server 3

const client = new MongoClient('mongodb://localhost:27017');
let db, cacheCollection;

// Connect to MongoDB
async function connectToDB() {
  await client.connect();
  db = client.db('cdn_edge_cache_3'); // Unique database for Edge Server 3
  cacheCollection = db.collection('cache');
  console.log('Edge Server 3 connected to MongoDB');
}
connectToDB();

// Serve content from cache or fetch from origin server
app.get('/content/:filename', async (req, res) => {
  const filename = req.params.filename;

  // Check if the content is cached
  const cachedContent = await cacheCollection.findOne({ filename });
  if (cachedContent) {
    // Serve from cache
    res.sendFile(path.join(__dirname, 'cached_content_3', filename)); // Unique cache directory
    console.log(`[Edge Server 3] Serving cached content: ${filename}`);
  } else {
    // Fetch from origin server if not cached
    try {
      const response = await axios.get(`http://localhost:3002/content/${filename}`, { responseType: 'stream' });
      response.data.pipe(res); // Send content to user

      // Save content to cache
      const cachedPath = path.join(__dirname, 'cached_content_3', filename);
      response.data.pipe(fs.createWriteStream(cachedPath));

      // Insert metadata into MongoDB
      await cacheCollection.insertOne({ filename, cachedAt: new Date() });
      console.log(`[Edge Server 3] Fetched and cached content: ${filename}`);
    } catch (error) {
      console.log(`[Edge Server 3] Error fetching content: ${filename}`, error);
      res.status(404).send('Content not found');
    }
  }
});

app.listen(PORT, () => {
  console.log(`Edge Server 3 running on port ${PORT}`);
});
