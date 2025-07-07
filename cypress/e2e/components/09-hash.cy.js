// Cypress E2E test for HashGenerator.vue
// Covers: generating, clearing, copying, and UI state

describe('Hash Generator Component', () => {
  const inputText = 'hello world';

  beforeEach(() => {
    cy.visit('/hash');
  });

  it('shows placeholder initially', () => {
    cy.get('[data-test-id=hash-input]').should('exist');
    cy.get('[data-test-id=hash-output]').should('not.exist');
    cy.get('[data-test-id=placeholder-message]').should('be.visible');
  });

  it('generates hash', () => {
    cy.get('[data-test-id=hash-input]').type(inputText, { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=hash-type-select]').select('sha256');
    cy.get('[data-test-id=generate-btn]').click();
    cy.get('[data-test-id=hash-output]').should('be.visible');
    cy.get('[data-test-id=hash-output] .hash-text').invoke('text').should('have.length.greaterThan', 10);
    cy.get('[data-test-id=placeholder-message]').should('not.exist');
  });

  it('clears output', () => {
    cy.get('[data-test-id=hash-input]').type(inputText, { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=generate-btn]').click();
    cy.get('[data-test-id=clear-btn]').click();
    cy.get('[data-test-id=hash-output]').should('not.exist');
    cy.get('[data-test-id=placeholder-message]').should('be.visible');
  });

  it('copies hash to clipboard', () => {
    cy.window().then(win => {
      cy.stub(win.navigator.clipboard, 'writeText').as('writeText');
    });
    cy.get('[data-test-id=hash-input]').type(inputText, { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=generate-btn]').click();
    cy.get('[data-test-id=copy-btn]').click();
    cy.get('[data-test-id=hash-output] .hash-text').invoke('text').then(hash => {
      cy.get('@writeText').should('have.been.calledWith', hash);
    });
  });

  it('disables buttons appropriately', () => {
    cy.get('[data-test-id=generate-btn]').should('be.disabled');
    cy.get('[data-test-id=clear-btn]').should('be.disabled');
    cy.get('[data-test-id=hash-input]').type(inputText, { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=generate-btn]').should('not.be.disabled');
    cy.get('[data-test-id=clear-btn]').should('be.disabled');
    cy.get('[data-test-id=generate-btn]').click();
    cy.get('[data-test-id=clear-btn]').should('not.be.disabled');
  });
}); 