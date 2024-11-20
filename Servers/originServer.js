const express = require('express');
const path = require('path');
const app = express();
const PORT = 3002; // Port for the Origin Server

// Serve content from 'content' folder
app.get('/content/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'content', filename);

  res.sendFile(filePath, (err) => {
    if (err) {
      console.log(`Error sending file: ${filename}`, err);
      res.status(404).send('Content not found');
    } else {
      console.log(`Content served: ${filename}`);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Origin Server running on port ${PORT}`);
});
