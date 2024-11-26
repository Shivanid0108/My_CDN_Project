const { MongoClient } = require('mongodb');

const client = new MongoClient('mongodb://localhost:27017');
let db;
let requestLogCollection;

async function connectToDB() {
  try {
    await client.connect();
    db = client.db('cdn_proxy_log');
    requestLogCollection = db.collection('request_logs');
    console.log('Connected to MongoDB for Proxy Server');
  } catch (error) {
    console.error('Error connecting to MongoDB for Proxy Server:', error);
  }
}

connectToDB();

async function logRequest(filename, sourceServer) {
  try {
    await requestLogCollection.insertOne({
      filename,
      sourceServer,
      timestamp: new Date(),
    });
    console.log(`[Proxy Database] Logged request for file: ${filename} from ${sourceServer}`);
  } catch (error) {
    console.error('[Proxy Database] Error logging request:', error);
  }
}

async function getRequestLogs(filename) {
  try {
    return await requestLogCollection.find({ filename }).toArray();
  } catch (error) {
    console.error('[Proxy Database] Error fetching request logs:', error);
    return [];
  }
}

module.exports = { logRequest, getRequestLogs };
