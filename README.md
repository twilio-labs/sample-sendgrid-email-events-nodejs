<a  href="https://www.twilio.com">
<img  src="https://static0.twilio.com/marketing/bundles/marketing/img/logos/wordmark-red.svg"  alt="Twilio"  width="250"  />
</a>
 
# Twilio SendGrid Email Sample App

[![Actions Status](https://github.com/twilio-labs/sample-template-nodejs/workflows/Node%20CI/badge.svg)](https://github.com/twilio-labs/sample-appointment-reminders/actions)

## About

This application allows you to send emails from a web UI. It will then track the statuses of said emails and when an email is opened, the app will send an SMS notification to a specified number.

Implementations in other languages:

| .NET | Java | Python | PHP | Ruby |
| :--- | :--- | :----- | :-- | :--- |
| TBD  | TBD  | TBD    | TBD | TBD  |

### How it works

1. The user visits the main page and enters a username and password to authenticate
2. They enter a recipient email address, a subject line and an email body.
3. They click "Send" to send the email via [Twilio SendGrid](https://www.twilio.com/sendgrid/email-api)
4. Any sent email can be tracked with their status on the `/sent` page of the app.
5. When an email is opened the server will send an SMS to notify a configured number using [Twilio Programmable SMS](https://www.twilio.com/sms)

## Features

- Send Emails via Twilio SendGrid
- Track status updates for sent emails
- Send SMS notifications for `open` events to a configured number

## Set up

### Requirements

- [Node.js](https://nodejs.org/)
- A Twilio account - [sign up](https://www.twilio.com/try-twilio)
- A Twilio SendGrid account - [sign up](https://signup.sendgrid.com)

### Configuration Values

Before you can begin you'll need to collect a couple of different configuration values.

#### General Settings

| Config&nbsp;Value | Description                                                                                                                                                                                                                |
| :---------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `USERS`           | You'll need to specify a list of username & password combinations to grant access. Examples: `username,password;anotherUser,secretPassword`. **Important**: you should change the authentication for production use cases. |

#### SendGrid Account Settings

| Config&nbsp;Value             | Description                                                                                                                                                                                                                                                              |
| :---------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SENDGRID_API_KEY`            | You'll need to [create an API key](https://sendgrid.com/docs/ui/account-and-settings/api-keys/#creating-an-api-key) for your SendGrid account.                                                                                                                           |
| `SENDER_EMAIL`                | A [verified email address](https://sendgrid.com/docs/ui/sending-email/sender-verification/) to send your emails from.                                                                                                                                                    |
| `SENDGRID_WEBHOOK_PUBLIC_KEY` | _Optional_: A public key from SendGrid if you want to [validate incoming event webhook requests](https://sendgrid.com/docs/for-developers/tracking-events/getting-started-event-webhook-security-features/#manage-the-signed-event-webhook-using-the-app) (Recommended). |

#### Twilio Account Settings

| Config&nbsp;Value     | Description                                                                                                                                                  |
| :-------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TWILIO_ACCOUNT_SID`  | Your primary Twilio account identifier - find this [in the Console](https://www.twilio.com/console).                                                         |
| `TWILIO_AUTH_TOKEN`   | Used to authenticate - [just like the above, you'll find this here](https://www.twilio.com/console).                                                         |
| `TWILIO_PHONE_NUMBER` | A Twilio phone number in [E.164 format](https://en.wikipedia.org/wiki/E.164) - you can [get one here](https://www.twilio.com/console/phone-numbers/incoming) |
| `NOTIFY_PHONE_NUMBER` | A phone number that will receive the SMS notifications. In E.164 format.                                                                                     |

### Local development

After the above requirements have been met:

1. Clone this repository and `cd` into it

```bash
git clone git@github.com:twilio-labs/sample-sendgrid-email-events-nodejs.git
cd sample-sendgrid-email-events-nodejs
```

2. Install dependencies

```bash
npm install
```

3. Set your environment variables

```bash
npm run setup
```

See [Configuration Values](#configuration-values) to locate the necessary environment variables.

4. Run the application

```bash
npm start
```

Alternatively, you can use this command to start the server in development mode. It will reload whenever you change any files.

```bash
npm run dev
```

5. Navigate to [http://localhost:3000](http://localhost:3000). You should be able to send emails now.

6. If you want to track email updates you'll have to either deploy your app or use a tool like `ngrok` to expose your localhost server to SendGrid. Afterwards you'll have to [update in your Mail Settings the Event Webhook](https://sendgrid.com/docs/for-developers/tracking-events/getting-started-event-webhook/#integrating) URL to something like this: `https://<your_url>/events/email`.

7. You should now be able to see status updates in /sent when you refresh and SMS should be sent whenever an SMS is opened.

### Tests

You can run the tests locally by typing:

```bash
npm test
```

### Cloud deployment

Additionally to trying out this application locally, you can deploy it to a variety of host services. Here is a small selection of them.

Please be aware that some of these might charge you for the usage or might make the source code for this application visible to the public. When in doubt research the respective hosting service first.

| Service                           |                                                                                     |
| :-------------------------------- | :---------------------------------------------------------------------------------- |
| [Heroku](https://www.heroku.com/) | [![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy) |

## Resources

- [Twilio Docs](https://www.twilio.com/docs)
- [Twilio SendGrid Docs](https://sendgrid.com/docs/for-developers/)

## Contributing

This template is open source and welcomes contributions. All contributions are subject to our [Code of Conduct](https://github.com/twilio-labs/.github/blob/master/CODE_OF_CONDUCT.md).

[Visit the project on GitHub](https://github.com/twilio-labs/sample-template-nodejs)

## License

[MIT](http://www.opensource.org/licenses/mit-license.html)

## Disclaimer

No warranty expressed or implied. Software is as is.

[twilio]: https://www.twilio.com
