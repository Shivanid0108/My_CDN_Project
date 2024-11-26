const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { createHttp2Server } = require('../utils/http2');
const { logRequest, logError } = require('../utils/logger');
const { getNextServer } = require('../utils/roundRobin');

const app = express();
const PORT = 3003;

app.use(cors());
app.use(express.json()); // For handling JSON requests

const edgeServers = [
  'http://localhost:3004',
  'http://localhost:3005',
  'http://localhost:3006',
];

const cacheDirectory = './cache';  // Directory where cached content is stored

// Handle content requests with round-robin
app.get('/content/:filename', async (req, res) => {
  logRequest(req);

  const filename = req.params.filename;
  const edgeServer = getNextServer(edgeServers);

  try {
    // Fetch content from selected edge server
    const response = await axios.get(`${edgeServer}/content/${filename}`);
    res.send(response.data);
  } catch (error) {
    logError(`Failed to fetch content from edge server: ${edgeServer}`, error);

    // Fallback to origin server
    try {
      const originResponse = await axios.get(`http://localhost:3002/content/${filename}`);
      res.send(originResponse.data);
    } catch (originError) {
      logError(`Failed to fetch content from origin server`, originError);
      res.status(404).send('Content not found');
    }
  }
});

// Cache Deletion Functionality
app.delete('/deleteCache/:filename', async (req, res) => {
  const filename = req.params.filename;
  const cachePath = path.join(cacheDirectory, filename);

  // Delete the file from the local cache directory if it exists
  if (fs.existsSync(cachePath)) {
    fs.unlinkSync(cachePath);
    logRequest(req);  // Log the cache deletion request
    res.status(200).send(`Cache for ${filename} deleted successfully`);
  } else {
    res.status(404).send('Cache file not found');
  }

  // Notify all edge servers to delete the cache for this file
  try {
    for (let edgeServer of edgeServers) {
      await axios.delete(`${edgeServer}/deleteCache/${filename}`);
    }
  } catch (error) {
    logError(`Error deleting cache on edge servers`, error);
    res.status(500).send('Error deleting cache on edge servers');
  }
});

// Video Upload
app.post('/uploadVideo', (req, res) => {
  const video = req.files.video;
  const uploadPath = path.join(__dirname, 'content', video.name);

  video.mv(uploadPath, (err) => {
    if (err) {
      return res.status(500).send('Error uploading video');
    }
    res.status(200).send('Video uploaded successfully');
  });
});

// Video Download
app.get('/downloadVideo/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'content', filename);

  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).send('Video not found');
  }
});

// Start the server with HTTP/2
createHttp2Server(app, PORT, './certs/edge-server-cert.pem', './certs/edge-server-key.pem');
