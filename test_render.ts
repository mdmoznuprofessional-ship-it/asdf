import http from 'http';

const reqData = JSON.stringify({
  svg: '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40"/></svg>',
  duration: 1,
  fps: 1,
  resolution: '1080p',
  background: 'Black',
  format: 'MP4'
});

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/render',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': reqData.length
  }
}, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log('Render Response:', body);
    const { jobId } = JSON.parse(body);
    if (!jobId) return;

    const poll = setInterval(() => {
      http.get(`http://localhost:3000/api/status/${jobId}`, res2 => {
        let body2 = '';
        res2.on('data', d => body2 += d);
        res2.on('end', () => {
          console.log('Status Response:', body2);
          const status = JSON.parse(body2);
          if (status.status === 'Completed' || status.status === 'Failed') {
            clearInterval(poll);
          }
        });
      });
    }, 1000);
  });
});

req.write(reqData);
req.end();
