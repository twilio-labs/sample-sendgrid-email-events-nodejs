const path = require('path');

if (!process.env.CI) {
  const isTest = process.env.NODE_ENV === 'test';
  require('dotenv-safe').config({
    path: isTest ? path.resolve(__dirname, '../.env.example') : undefined,
    allowEmptyValues: isTest,
  });
}

const cfg = {};

// HTTP Port to run our web application
cfg.port = process.env.PORT || 3000;

// Your Twilio SendGrid API Key
// https://www.sendgrid.com
//
// A good practice is to store these string values as system environment
// variables, and load them from there as we are doing below. Alternately,
// you could hard code these values here as strings.
cfg.sendGridApiKey = process.env.SENDGRID_API_KEY || '';

// A valid sender email address for your Twilio SendGrid account
cfg.senderEmail = process.env.SENDER_EMAIL;

// Users available to access
cfg.users = (process.env.USERS || '')
  .split(';')
  .reduce((users, credentialPair) => {
    let [username, password] = credentialPair.split(',');
    username = (username || '').trim();
    password = (password || '').trim();

    if (!username || !password) {
      return users;
    }

    return {
      ...users,
      [username]: password,
    };
  }, {});

// Public key for the Twilio SendGrid Webhook Verification
cfg.sendGridWebhookPublicKey = process.env.SENDGRID_WEBHOOK_PUBLIC_KEY || '';

cfg.twilio = {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  notifyNumber: process.env.NOTIFY_PHONE_NUMBER,
};

// Export configuration object
module.exports = cfg;
