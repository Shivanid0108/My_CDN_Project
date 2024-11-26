const fs = require('fs');
const http2 = require('http2');

function createHttp2Server(app, port, certPath, keyPath) {
  const serverOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };

  return http2.createServer(serverOptions, app).listen(port, () => {
    console.log(`Server running on HTTP/2 and HTTPS at port ${port}`);
  });
}

module.exports = { createHttp2Server };
