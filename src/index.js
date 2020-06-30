const pkg = require('../package.json');
const cfg = require('./config');
const server = require('./server');

server.listen(cfg.port, function() {
  console.log(`Starting ${pkg.name} at http://localhost:${cfg.port}`);
});
