const express = require('express');
const twilio = require('twilio');
const { EventWebhook, EventWebhookHeader } = require('@sendgrid/eventwebhook');
const db = require('../db');
const cfg = require('../config');

/* eslint-disable new-cap */
const router = express.Router();

/**
 * Sends an SMS to the configured phone number via Twilio to notify that an
 * email has been opened.
 * @param {express.Request & { rawBody: string }} req Request object
 * @param {express.Response} res Response object
 * @param {Function} next Next request handler
 */
function verifySendGrid(req, res, next) {
  if (process.env.NODE_ENV === 'test') {
    next();
    return;
  }

  const eventWebhook = new EventWebhook();
  const payload = req.rawBody;
  const timestamp = req.get(EventWebhookHeader.TIMESTAMP());
  const signature = req.get(EventWebhookHeader.SIGNATURE());
  const publicKey = cfg.sendGridWebhookPublicKey;
  const ecPublicKey = eventWebhook.convertPublicKeyToECDSA(publicKey);

  try {
    const valid = eventWebhook.verifySignature(
      ecPublicKey,
      payload,
      signature,
      timestamp
    );
    if (valid) {
      next();
      return;
    }
  } catch (err) {
    // carry on
  }
  res.status(401).send();
}

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
router.post('/email', verifySendGrid, async (req, res, next) => {
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
