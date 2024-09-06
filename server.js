const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();

// Set FFmpeg binary path to ffmpeg-static
ffmpeg.setFfmpegPath(require('ffmpeg-static'));

const inputRtmpUrl = 'rtmp://stream.milivetv.in:1935/static/k2tv';
const outputHlsPath = path.join(__dirname, 'public', 'hls');

// Enable CORS
app.use(cors());

// Ensure the public directory exists for static files
app.use(express.static('public'));

// Log that the server is starting
console.log('Server is starting...');

// Start FFmpeg process to convert RTMP to HLS
console.log('Starting FFmpeg process...');
ffmpeg(inputRtmpUrl)
  .outputOptions([
    '-c:v copy',
    '-c:a aac',
    '-f hls',
    '-hls_time 10', // Duration of each segment in seconds
    '-hls_list_size 5', // Number of segments to keep in the playlist
    '-hls_flags delete_segments', // Automatically delete old segments
    '-hls_segment_filename', path.join(outputHlsPath, 'segment_%03d.ts')
  ])
  .output(path.join(outputHlsPath, 'stream.m3u8'))
  
  .on('end', () => {
    console.log('HLS conversion finished successfully.');
  })
  .on('error', (err) => {
    console.error('An error occurred during HLS conversion:', err.message);
  })
  .run();

// Set up a basic server to serve HLS files
const port = 8080; // Change this port if needed
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Log unhandled exceptions and rejections
// process.on('uncaughtException', (err) => {
//   console.error('Uncaught Exception:', err.message);
// });

// process.on('unhandledRejection', (reason, promise) => {
//   console.error('Unhandled Rejection at:', promise, 'reason:', reason);
// });
