// Cypress E2E test for JsonFormatter.vue
// Covers: valid/invalid JSON, format, clear, copy, error, placeholder

describe('JsonFormatter Component', () => {
  const validJson = '{"foo": "bar", "num": 42, "bool": true}';
  const formattedJson = `{
  "foo": "bar",
  "num": 42,
  "bool": true
}`;
  const invalidJson = '{foo: bar}';

  beforeEach(() => {
    cy.visit('/json');
  });

  it('shows placeholder initially', () => {
    cy.get('[data-test-id=placeholder-message]').should('be.visible');
    cy.get('[data-test-id=json-output]').should('not.exist');
    cy.get('[data-test-id=error-message]').should('not.exist');
  });

  it('formats valid JSON', () => {
    cy.get('[data-test-id=json-input]').type(validJson, { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=format-btn]').click();
    cy.get('[data-test-id=json-output]').should('contain.text', '"foo"');
    cy.get('[data-test-id=json-output]').should('contain.text', '"bar"');
    cy.get('[data-test-id=json-output]').should('contain.text', '"num"');
    cy.get('[data-test-id=json-output]').should('contain.text', '42');
    cy.get('[data-test-id=error-message]').should('not.exist');
    cy.get('[data-test-id=placeholder-message]').should('not.exist');
  });

  it('clears input and output', () => {
    cy.get('[data-test-id=json-input]').type(validJson, { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=format-btn]').click();
    cy.get('[data-test-id=clear-btn]').click();
    cy.get('[data-test-id=json-input]').should('have.value', '');
    cy.get('[data-test-id=json-output]').should('not.exist');
    cy.get('[data-test-id=placeholder-message]').should('be.visible');
  });

  it('shows error for invalid JSON', () => {
    cy.get('[data-test-id=json-input]').type(invalidJson, { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=format-btn]').click();
    cy.get('[data-test-id=error-message]').should('be.visible').and('contain.text', 'Invalid JSON');
    cy.get('[data-test-id=json-output]').should('not.exist');
    cy.get('[data-test-id=placeholder-message]').should('not.exist');
  });

  it('copies formatted JSON to clipboard', () => {
    cy.window().then(win => {
      cy.stub(win.navigator.clipboard, 'writeText').as('writeText');
    });
    cy.get('[data-test-id=json-input]').type(validJson, { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=format-btn]').click();
    cy.get('[data-test-id=copy-btn]').click();
    cy.get('@writeText').should('have.been.calledWith', formattedJson);
  });

  it('disables buttons appropriately', () => {
    cy.get('[data-test-id=format-btn]').should('be.disabled');
    cy.get('[data-test-id=clear-btn]').should('be.disabled');
    cy.get('[data-test-id=copy-btn]').should('be.disabled');
    cy.get('[data-test-id=json-input]').type(validJson, { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=format-btn]').should('not.be.disabled');
    cy.get('[data-test-id=clear-btn]').should('not.be.disabled');
    cy.get('[data-test-id=copy-btn]').should('be.disabled');
    cy.get('[data-test-id=format-btn]').click();
    cy.get('[data-test-id=copy-btn]').should('not.be.disabled');
  });
}); 