const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3002;

app.use(fileUpload());
app.use(express.static('content'));  // Serve static content from the content folder

// Serve content from the origin server
app.get('/content/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, 'content', filename);

  if (fs.existsSync(filepath)) {
    res.sendFile(filepath);
  } else {
    res.status(404).send('File not found on Origin Server');
  }
});

// Upload Video
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

// Download Video
app.get('/downloadVideo/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'content', filename);

  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).send('Video not found');
  }
});

// Delete Cached Content
app.delete('/deleteCache/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'content', filename);

  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) {
        return res.status(500).send('Error deleting cached content');
      }
      res.status(200).send('Cached content deleted successfully');
    });
  } else {
    res.status(404).send('Cached content not found');
  }
});

app.listen(PORT, () => {
  console.log(`Origin server listening on port ${PORT}`);
});
