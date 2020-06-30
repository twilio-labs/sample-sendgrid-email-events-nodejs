const mockClient = {
  messages: {
    create: jest.fn().mockImplementation(() => {
      return Promise.resolve({
        accountSid: 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        apiVersion: '2010-04-01',
        body: 'Hello test',
        dateCreated: 'Thu, 30 Jul 2015 20:12:31 +0000',
        dateSent: 'Thu, 30 Jul 2015 20:12:33 +0000',
        dateUpdated: 'Thu, 30 Jul 2015 20:12:33 +0000',
        direction: 'outbound-api',
        errorCode: null,
        errorMessage: null,
        from: '+12223334444',
        messagingServiceSid: 'MGXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        numMedia: '0',
        numSegments: '1',
        price: null,
        priceUnit: null,
        sid: 'MMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        status: 'sent',
        subresourceUris: {
          media:
            '/2010-04-01/Accounts/ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/Messages/SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/Media.json',
        },
        to: '+13334445555',
        uri:
          '/2010-04-01/Accounts/ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/Messages/SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.json',
      });
    }),
  },
};

jest.mock('twilio', () => {
  return function() {
    return mockClient;
  };
});

const supertest = require('supertest');
const nock = require('nock');
const app = require('../src/server');
const {
  addSentEmailEntry,
  getAllEmails,
  clearAllEmails,
} = require('../src/db');
const cfg = require('../src/config');
const agent = supertest(app);

// don't let any traffic through to the internet except localhost
nock.disableNetConnect();
nock.enableNetConnect('127.0.0.1');

const EXAMPLE_PROCESSED_EVENT = {
  email: 'support@twilio.com',
  timestamp: 1594136210,
  event: 'processed',
  sg_message_id: 'example-id-1.event-id-1',
};
const EXAMPLE_DELIVERED_EVENT = {
  email: 'support@twilio.com',
  timestamp: 1594136218,
  event: 'delivered',
  sg_message_id: 'example-id-1.event-id-2',
};

const EXAMPLE_OPEN_EVENT = {
  email: 'support@twilio.com',
  timestamp: 1594136228,
  event: 'open',
  sg_message_id: 'example-id-1.event-id-3',
};

const EXAMPLE_EMAIL_DB_ENTRY = {
  messageId: 'example-id-1',
  to: 'support@twilio.com',
  subject: 'Test Email',
  timestamp: 1594136200 * 1000,
  status: 'newly-sent',
  sentAt: 1594136200 * 1000,
};

describe('events', () => {
  beforeEach(async () => {
    await clearAllEmails();

    await addSentEmailEntry(
      EXAMPLE_EMAIL_DB_ENTRY.messageId,
      EXAMPLE_EMAIL_DB_ENTRY.to,
      EXAMPLE_EMAIL_DB_ENTRY.subject,
      EXAMPLE_EMAIL_DB_ENTRY.timestamp
    );
  });

  describe('POST /events/email', () => {
    test('updates stored events correctly', async () => {
      const resp = await agent
        .post('/events/email')
        .send([EXAMPLE_DELIVERED_EVENT, EXAMPLE_PROCESSED_EVENT]);
      expect(resp.text).toEqual('');
      const entries = await getAllEmails();
      expect(entries).toEqual([
        {
          ...EXAMPLE_EMAIL_DB_ENTRY,
          timestamp: EXAMPLE_DELIVERED_EVENT.timestamp * 1000,
          status: EXAMPLE_DELIVERED_EVENT.event,
        },
      ]);
    });

    test('sends an sms by calling twilio for open events', async () => {
      const resp = await agent.post('/events/email').send([EXAMPLE_OPEN_EVENT]);
      expect(resp.text).toEqual('');
      const entries = await getAllEmails();
      expect(entries).toEqual([
        {
          ...EXAMPLE_EMAIL_DB_ENTRY,
          timestamp: EXAMPLE_OPEN_EVENT.timestamp * 1000,
          status: EXAMPLE_OPEN_EVENT.event,
        },
      ]);
      expect(mockClient.messages.create).toHaveBeenCalledWith({
        from: cfg.twilio.phoneNumber,
        to: cfg.twilio.notifyNumber,
        body: 'Your email to support@twilio.com has been opened.',
      });
    });
  });
});
