document.getElementById('uploadBtn').addEventListener('click', uploadVideo);
document.getElementById('downloadBtn').addEventListener('click', downloadVideo);
document.getElementById('deleteCacheBtn').addEventListener('click', deleteCache);
document.getElementById('playbackSpeed').addEventListener('change', changePlaybackSpeed);

const serverUrl = 'http://localhost:3002';  // Replace with the actual server URL

// Upload Video
async function uploadVideo() {
  const videoFile = document.getElementById('videoFile').files[0];
  const statusDiv = document.getElementById('uploadStatus');
  
  if (!videoFile) {
    statusDiv.textContent = 'Please select a video file to upload.';
    return;
  }

  const formData = new FormData();
  formData.append('video', videoFile);

  try {
    const response = await fetch(`${serverUrl}/uploadVideo`, {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      statusDiv.textContent = 'Video uploaded successfully!';
    } else {
      statusDiv.textContent = 'Error uploading video!';
    }
  } catch (error) {
    statusDiv.textContent = 'Error uploading video: ' + error.message;
  }
}

// Download Video
async function downloadVideo() {
  const filename = document.getElementById('downloadFilename').value;
  const statusDiv = document.getElementById('downloadStatus');

  if (!filename) {
    statusDiv.textContent = 'Please enter a filename to download.';
    return;
  }

  try {
    const response = await fetch(`${serverUrl}/downloadVideo/${filename}`);
    if (response.ok) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const videoPlayer = document.getElementById('videoPlayer');
      videoPlayer.src = url;
      statusDiv.textContent = 'Video downloaded and ready to play.';
    } else {
      statusDiv.textContent = 'Error downloading video: File not found.';
    }
  } catch (error) {
    statusDiv.textContent = 'Error downloading video: ' + error.message;
  }
}

// Delete Cached Content
async function deleteCache() {
  const filename = document.getElementById('deleteFilename').value;
  const statusDiv = document.getElementById('deleteStatus');

  if (!filename) {
    statusDiv.textContent = 'Please enter a filename to delete.';
    return;
  }

  try {
    const response = await fetch(`${serverUrl}/deleteCache/${filename}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      statusDiv.textContent = 'Cached content deleted successfully.';
    } else {
      statusDiv.textContent = 'Error deleting cached content: File not found.';
    }
  } catch (error) {
    statusDiv.textContent = 'Error deleting cached content: ' + error.message;
  }
}

// Change Playback Speed
function changePlaybackSpeed() {
  const videoPlayer = document.getElementById('videoPlayer');
  const playbackSpeed = document.getElementById('playbackSpeed').value;
  videoPlayer.playbackRate = parseFloat(playbackSpeed);
}
