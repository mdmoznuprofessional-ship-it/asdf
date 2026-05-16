import http from 'http';

const jobId = process.argv[2];
if (!jobId) {
  console.log('Provide jobId');
  process.exit();
}

const poll = setInterval(() => {
  http.get(`http://localhost:3000/api/status/${jobId}`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const json = JSON.parse(data);
      console.log(json);
      if (json.status === 'Completed' || json.status === 'Failed') {
        clearInterval(poll);
      }
    });
  });
}, 1000);
