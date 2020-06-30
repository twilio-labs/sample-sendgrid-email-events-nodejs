// type definitions for Cypress object "cy"
// eslint-disable-next-line
/// <reference types="cypress" />

// check this file using TypeScript if available
// @ts-check

describe('/', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('contains title', () => {
    cy.get('h1').contains('Email Sample App');
  });

  it('contains a link to /sent', () => {
    const link = cy.get('a[href="/sent"]');
    link.contains('See all sent emails');
  });

  it('sends an email', () => {
    cy.server();
    cy.route('POST', '/email/send', 'fixture:send-email.json').as(
      'sendEmailActivity'
    );

    cy.get('#toInput')
      .clear()
      .type('help@twilio.com');
    cy.get('#bodyInput')
      .clear()
      .type('This is a test message');
    cy.get('#subjectInput')
      .clear()
      .type('This is automated');
    cy.get('#emailForm').submit();
    cy.wait('@sendEmailActivity')
      .its('requestBody')
      .should('deep.equal', {
        to: 'help@twilio.com',
        body: 'This is a test message',
        subject: 'This is automated',
      });
    cy.get('#dialogTitle').contains('Email Sent!');
    const dialog = cy.get('#dialog');
    dialog.should('have.class', 'alert-success');
    dialog.should('not.have.class', 'd-none');
    cy.get('#dialogContent').contains('Your Email has been sent!');
  });

  it('shows error message', () => {
    cy.server();
    cy.route('POST', '/email/send', 'fixture:error-send-email.json').as(
      'sendEmailActivity'
    );

    cy.get('#toInput')
      .clear()
      .type('help@twilio.com');
    cy.get('#bodyInput')
      .clear()
      .type('This is a test message with the intention to fail');
    cy.get('#subjectInput')
      .clear()
      .type('This is automated');
    cy.get('#emailForm').submit();
    cy.wait('@sendEmailActivity')
      .its('requestBody')
      .should('deep.equal', {
        to: 'help@twilio.com',
        subject: 'This is automated',
        body: 'This is a test message with the intention to fail',
      });
    cy.get('#dialogTitle').contains('Error');
    const dialog = cy.get('#dialog');
    dialog.should('have.class', 'alert-danger');
    dialog.should('not.have.class', 'd-none');
    cy.get('#dialogContent').contains('Oh no :( something went wrong.');
  });
});
