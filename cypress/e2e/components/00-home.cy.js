/// <reference types="cypress" />

// Should test that the home page redirects to the json formatter page

describe('Home Page Redirect', () => {
  it('redirects to the JSON Formatter page', () => {
    cy.visit('/');
    cy.url().should('include', '/json');
    cy.get('[data-test-id=placeholder-message]').should('be.visible');
  });
});

