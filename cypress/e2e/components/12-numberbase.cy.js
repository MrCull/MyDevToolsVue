// Cypress E2E test for NumberBaseConverter.vue
// Covers: converting, clearing, copying, and UI state

describe('Number Base Converter Component', () => {
  beforeEach(() => {
    cy.visit('/numberbase');
    cy.get('[data-test-id=clear-btn]').click();
  });

  it('shows placeholder initially', () => {
    cy.get('[data-test-id=number-input]').should('exist');
    cy.get('[data-test-id=unit-output]').should('not.exist');
    cy.get('[data-test-id=placeholder-message]').should('be.visible');
  });

  it('converts number between bases', () => {
    cy.get('[data-test-id=number-input]').clear().type('255', { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=from-base-select]').select('10');
    cy.get('[data-test-id=to-base-select]').select('16');
    cy.get('[data-test-id=number-output]').should('be.visible');
    cy.get('[data-test-id=number-output] .result-text').should('have.text', 'FF');
    cy.get('[data-test-id=placeholder-message]').should('not.exist');
  });

  it('clears output', () => {
    cy.get('[data-test-id=number-input]').clear().type('255', { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=from-base-select]').select('10');
    cy.get('[data-test-id=to-base-select]').select('16');
    cy.get('[data-test-id=clear-btn]').click();
    cy.get('[data-test-id=number-output]').should('not.exist');
    cy.get('[data-test-id=placeholder-message]').should('be.visible');
  });

  it('copies converted number to clipboard', () => {
    cy.window().then(win => {
      cy.stub(win.navigator.clipboard, 'writeText').as('writeText');
    });
    cy.get('[data-test-id=number-input]').clear().type('255', { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=from-base-select]').select('10');
    cy.get('[data-test-id=to-base-select]').select('16');
    cy.get('[data-test-id=copy-btn]').click();
    cy.get('[data-test-id=number-output] .result-text').invoke('text').then(text => {
      cy.get('@writeText').should('have.been.calledWith', text);
    });
  });

  it('disables clear button appropriately', () => {
    cy.get('[data-test-id=clear-btn]').should('be.disabled');
    cy.get('[data-test-id=number-input]').clear().type('255', { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=from-base-select]').select('10');
    cy.get('[data-test-id=to-base-select]').select('16');
    cy.get('[data-test-id=clear-btn]').should('not.be.disabled');
    cy.get('[data-test-id=clear-btn]').click();
    cy.get('[data-test-id=clear-btn]').should('be.disabled');
  });
});
