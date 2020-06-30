const basicAuth = require('express-basic-auth');
const cfg = require('./config');

// We are using basic auth here to keep the demo short but you should modify
// this to a more robust and flexible auto solution
const authMiddleware = basicAuth({
  users: cfg.users,
  challenge: true,
});

module.exports = { authMiddleware };
