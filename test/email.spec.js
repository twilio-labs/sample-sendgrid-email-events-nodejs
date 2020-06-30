const supertest = require('supertest');
const nock = require('nock');
const app = require('../src/server');
const {
  clearAllEmails,
  addSentEmailEntry,
  getAllEmails,
} = require('../src/db');
const agent = supertest(app);

// don't let any traffic through to the internet except localhost
nock.disableNetConnect();
nock.enableNetConnect('127.0.0.1');

nock('https://api.sendgrid.com')
  .persist()
  .post(/\/v3\/mail\/send/)
  .reply(200, {}, { 'X-Message-Id': 'example-id-2' });

const EXAMPLE_EMAIL_DB_ENTRY = {
  messageId: 'example-id-1',
  to: 'support@twilio.com',
  subject: 'Test Email',
  timestamp: 1594136200 * 1000,
  status: 'newly-sent',
  sentAt: 1594136200 * 1000,
};
const FAKE_TIME = 1594136400 * 1000;

const backupDateNow = Date.now;

describe('email', () => {
  beforeAll(() => {
    global.Date.now = jest.fn(() => 1594136400 * 1000);
  });

  afterAll(() => {
    global.Date.now = backupDateNow;
  });

  beforeEach(async () => {
    await clearAllEmails();

    await addSentEmailEntry(
      EXAMPLE_EMAIL_DB_ENTRY.messageId,
      EXAMPLE_EMAIL_DB_ENTRY.to,
      EXAMPLE_EMAIL_DB_ENTRY.subject,
      EXAMPLE_EMAIL_DB_ENTRY.timestamp
    );
  });

  describe('GET /', () => {
    test('returns index.html', async () => {
      const response = await agent.get('/');
      expect(response.status).toBe(200);
      expect(response.text).toContain('Email Sample App');
    });
  });

  describe('GET /sent', () => {
    test('returns the JSON', async () => {
      const response = await agent.get('/sent');
      expect(response.status).toBe(200);
      expect(response.text).toContain(
        JSON.stringify(
          [
            {
              ...EXAMPLE_EMAIL_DB_ENTRY,
              sentAt: new Date(EXAMPLE_EMAIL_DB_ENTRY.sentAt).toISOString(),
            },
          ],
          null,
          '\t'
        ).replace(/"/g, '&quot;')
      );
    });
  });

  describe('POST /email/send', () => {
    beforeEach(async () => {
      await clearAllEmails();
    });

    test('sends email and stores data', async () => {
      const response = await agent.post('/email/send').send({
        to: 'help@twilio.com',
        subject: 'Hello from Tests',
        body: 'Hey there',
      });

      expect(response.status).toBe(200);
      expect(JSON.parse(response.text)).toEqual({
        status: 'success',
        message: 'Email sent to help@twilio.com.',
      });

      const emails = await getAllEmails();
      expect(emails).toEqual([
        {
          messageId: 'example-id-2',
          status: 'newly-sent',
          to: 'help@twilio.com',
          subject: 'Hello from Tests',
          timestamp: FAKE_TIME,
          sentAt: FAKE_TIME,
        },
      ]);
    });
  });
});
