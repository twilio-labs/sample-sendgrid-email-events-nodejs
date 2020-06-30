const cfg = {
  port: 3000,
  sendGridApiKey: 'SG.xxxxxxxxxxxxxxxxxxxxxx',
  senderEmail: 'hi@example.com',
  users: { batman: 'justice-league' },
  sendGridWebhookPublicKey: '',
  twilio: {
    accountSid: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    authToken: '<TWILIO_AUTH_TOKEN>',
    phoneNumber: '+12223334444',
    notifyNumber: '+13334445555',
  },
};

module.exports = cfg;
