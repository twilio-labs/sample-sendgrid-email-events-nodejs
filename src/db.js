/**
 * This file contains a sample database interface inspired by Mongoose for
 * MongoDB. Instead of using an actual database it will use a JSON file in
 * _data/db.json to store the data.
 *
 * For a production environment you should swap this with your own database.
 */
const low = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');
const Memory = require('lowdb/adapters/Memory');
const path = require('path');
const os = require('os');

const DB_FILE = path.resolve(__dirname, '..', '_data', 'db.json');
// process.env.NODE_ENV === 'test'
//   ? path.resolve(os.tmpdir(), 'db.test.json')
//   :

const adapter =
  process.env.NODE_ENV === 'test'
    ? new Memory()
    : new FileAsync(DB_FILE, {
        defaultValue: {
          emailMessages: [],
        },
      });

let db;

/**
 * Returns a cached database instance of lowdb
 * @return {Promise<*>} database instance
 */
async function getDb() {
  if (db) {
    return db;
  }

  db = await low(adapter);
  return db;
}

const DB_KEY = 'emailMessages';

/**
 * Stores a new entry of a sent email in the local database
 *
 * @param {string} messageId the SendGrid ID of a message
 * @param {string} to email address
 * @param {string} subject Subject line of the email
 * @param {number} timestamp timestamp in milliseconds of when the email was created
 */
async function addSentEmailEntry(messageId, to, subject, timestamp) {
  const db = await getDb();
  await db
    .get(DB_KEY)
    .push({
      messageId,
      to,
      subject,
      timestamp,
      status: 'newly-sent',
      sentAt: timestamp,
    })
    .write();
}

/**
 * Finds email by using the messageId and updates the status and timestamp of the message
 *
 * @param {string} messageId the SendGrid ID of a message
 * @param {string} status the new status to be set
 * @param {string} timestamp latest timestamp in milliseconds
 */
async function updateEmailStatus(messageId, status, timestamp) {
  const db = await getDb();
  await db
    .get(DB_KEY)
    .find({ messageId })
    .assign({ status, timestamp })
    .write();
}

/**
 * Retrieves all emails stored in the database
 */
async function getAllEmails() {
  const db = await getDb();
  return db.get(DB_KEY).value();
}

/**
 * Removes all emails from the database
 */
async function clearAllEmails() {
  const db = await getDb();
  return db.set(DB_KEY, []).write();
}

module.exports = {
  addSentEmailEntry,
  updateEmailStatus,
  getAllEmails,
  clearAllEmails,
  DB_FILE,
};
