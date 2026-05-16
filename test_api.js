import http from 'http';

const data = JSON.stringify({
  svg: '<svg width="100" height="100"><circle cx="50" cy="50" r="40" stroke="red" fill="transparent" stroke-width="5"/></svg>',
  duration: 1,
  fps: 10,
  resolution: '1080p',
  background: 'Transparent',
  format: 'MP4'
});

const req = http.request('http://localhost:3000/api/render', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, (res) => {
  let resData = '';
  res.on('data', chunk => resData += chunk);
  res.on('end', () => console.log('OK:', res.statusCode, resData));
});

req.on('error', (err) => console.error('ERR:', err.message));
req.write(data);
req.end();
