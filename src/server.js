'use strict';

const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressHandlebars = require('express-handlebars');

const { authMiddleware } = require('./auth');
const emailRoutes = require('./routes/email');
const eventRoutes = require('./routes/events');

const app = express();

// view engine setup
app.set('views', path.resolve(__dirname, '../views'));
app.engine('hbs', expressHandlebars({ extname: '.hbs' }));
app.set('view engine', 'hbs');

if (process.env.NODE_ENV !== 'test') {
  app.use(logger('dev'));
}

/**
 * Adds a new "rawBody" property to the request containing a string representation of the buffer
 *
 * @param {express.Request} req standard Express request object
 * @param {express.Response} res standard Express response object
 * @param {Buffer} rawBody a buffer of the request payload
 * @param {BufferEncoding} encoding encoding of the payload
 */
function storeRawBody(req, res, rawBody, encoding) {
  if (rawBody && rawBody.length) {
    req['rawBody'] = rawBody.toString(encoding || 'utf8');
  }
}

app.use(bodyParser.json({ verify: storeRawBody }));
app.use(
  bodyParser.urlencoded({
    extended: false,
    verify: storeRawBody,
  })
);
app.use(cookieParser());
app.use(express.static(path.resolve(__dirname, '../public')));

app.use('/events', eventRoutes);
if (process.env.NODE_ENV === 'test') {
  app.use('/', emailRoutes);
} else {
  app.use('/', authMiddleware, emailRoutes);
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  if (err.status !== 404) {
    console.error(err);
  }

  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
  });
});

module.exports = app;
