'use strict';

const express = require('express');
const sgMail = require('@sendgrid/mail');
const cfg = require('../config');
const db = require('../db');

sgMail.setApiKey(cfg.sendGridApiKey);

/* eslint-disable new-cap */
const router = express.Router();

// GET: /
router.get('/', (req, res, next) => {
  res.render('index', {
    title: 'Email Sample App',
    scripts: ['js/send-email.js'],
  });
});

router.get('/sent', async (req, res, next) => {
  const emails = (await db.getAllEmails())
    .sort((a, b) => {
      return b.sentAt - a.sentAt;
    })
    .map(email => {
      return {
        ...email,
        sentAt: new Date(email.sentAt).toISOString(),
      };
    });

  res.render('sent-emails', { emails: JSON.stringify(emails, null, '\t') });
});

// POST: /email/send
router.post('/email/send', async (req, res, next) => {
  const { to, body, subject } = req.body;
  try {
    const currentTime = Date.now();
    const mail = await sgMail.send({
      to,
      from: cfg.senderEmail,
      subject,
      text: body,
      html: body,
    });

    await db.addSentEmailEntry(
      mail[0].headers['x-message-id'],
      to,
      subject,
      currentTime
    );

    res.send({
      status: 'success',
      message: `Email sent to ${req.body.to}.`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      status: 'error',
      message: 'Failed to send Email. Check server logs for more details.',
    });
  }
});

module.exports = router;
