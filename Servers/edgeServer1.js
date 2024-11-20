const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');
const axios = require('axios');
const fs = require('fs');
const app = express();
const PORT = 3004; // Port for Edge Server 1

const client = new MongoClient('mongodb://localhost:27017');
let db, cacheCollection;

// Connect to MongoDB
async function connectToDB() {
  await client.connect();
  db = client.db('cdn_edge_cache');
  cacheCollection = db.collection('cache');
  console.log('Edge Server connected to MongoDB');
}
connectToDB();

// Serve content from cache or fetch from origin server
app.get('/content/:filename', async (req, res) => {
  const filename = req.params.filename;

  // Check if the content is cached
  const cachedContent = await cacheCollection.findOne({ filename });
  if (cachedContent) {
    // Serve from cache
    res.sendFile(path.join(__dirname, 'cached_content', filename));
    console.log(`Serving cached content: ${filename}`);
  } else {
    // Fetch from origin server if not cached
    try {
      const response = await axios.get(`http://localhost:3002/content/${filename}`, { responseType: 'stream' });
      response.data.pipe(res); // Send content to user

      // Save content to cache
      const cachedPath = path.join(__dirname, 'cached_content', filename);
      response.data.pipe(fs.createWriteStream(cachedPath));

      // Insert metadata into MongoDB
      await cacheCollection.insertOne({ filename, cachedAt: new Date() });
      console.log(`Fetched and cached content: ${filename}`);
    } catch (error) {
      console.log(`Error fetching content: ${filename}`, error);
      res.status(404).send('Content not found');
    }
  }
});

app.listen(PORT, () => {
  console.log(`Edge Server 1 running on port ${PORT}`);
});
