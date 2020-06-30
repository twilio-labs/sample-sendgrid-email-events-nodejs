const express = require('express');
const twilio = require('twilio');
const db = require('../db');
const cfg = require('../config');

/* eslint-disable new-cap */
const router = express.Router();

/**
 * Sends an SMS to the configured phone number via Twilio to notify that an
 * email has been opened.
 * @param {string} recipientEmail the email of the recipient
 */
async function sendSMSNotification(recipientEmail) {
  if (cfg.twilio.accountSid) {
    const client = twilio(cfg.twilio.accountSid, cfg.twilio.authToken);
    try {
      await client.messages.create({
        from: cfg.twilio.phoneNumber,
        to: cfg.twilio.notifyNumber,
        body: `Your email to ${recipientEmail} has been opened.`,
      });
    } catch (err) {
      console.error(err);
    }
  }
}

// POST: /events/email
router.post('/email', async (req, res, next) => {
  const events = req.body;

  const normalizedEvents = events
    .map(rawEvent => {
      return {
        to: rawEvent.email,
        timestamp: rawEvent.timestamp * 1000,
        status: rawEvent.event,
        messageId: rawEvent.sg_message_id.split('.')[0],
      };
    })
    .sort((a, b) => a.timestamp - b.timestamp);

  for (const event of normalizedEvents) {
    await db.updateEmailStatus(event.messageId, event.status, event.timestamp);
    if (event.status === 'open') {
      await sendSMSNotification(event.to);
    }
  }

  res.send();
});

module.exports = router;
