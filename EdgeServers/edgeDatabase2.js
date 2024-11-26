const { MongoClient } = require('mongodb');

const client = new MongoClient('mongodb://localhost:27017');
let db;
let cacheCollection;

async function connectToDB() {
  try {
    await client.connect();
    db = client.db('cdn_edge_cache_2'); // Use 'cdn_edge_cache_2' for Edge Server 2
    cacheCollection = db.collection('cache');
    await cacheCollection.createIndex({ cachedAt: 1 }, { expireAfterSeconds: 3600 });
    console.log('Connected to MongoDB for Edge Server 2');
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
  }
}

connectToDB();

// Get cached content from the database
async function getCachedContent(filename) {
  try {
    const cachedContent = await cacheCollection.findOne({ filename });
    return cachedContent;
  } catch (error) {
    console.error('Error fetching cached content:', error);
    throw new Error('Error fetching cached content');
  }
}

// Cache new content in the database
async function cacheContent(filename, data) {
  try {
    await cacheCollection.insertOne({ filename, data, cachedAt: new Date() });
    console.log(`Cached content: ${filename}`);
  } catch (error) {
    console.error('Error caching content:', error);
    throw new Error('Error caching content');
  }
}

// Delete cached content from the database
async function deleteCachedContent(filename) {
  try {
    const result = await cacheCollection.deleteOne({ filename });

    if (result.deletedCount === 0) {
      console.log(`No cache found for deletion: ${filename}`);
    } else {
      console.log(`Deleted cached content: ${filename}`);
    }
  } catch (error) {
    console.error('Error deleting cached content:', error);
    throw new Error('Error deleting cached content');
  }
}

module.exports = { getCachedContent, cacheContent, deleteCachedContent };
