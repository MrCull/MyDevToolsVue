// Cypress E2E test for UnitConverter.vue
// Covers: converting, swapping, clearing, copying, and UI state

describe('Unit Converter Component', () => {
  beforeEach(() => {
    cy.visit('/unit');
  });

  it('shows placeholder initially', () => {
    cy.get('[data-test-id=category-select]').should('exist');
    cy.get('[data-test-id=unit-output]').should('not.exist');
    cy.get('[data-test-id=placeholder-message]').should('be.visible');
  });

  it('converts value between units', () => {
    cy.get('[data-test-id=category-select]').select('length');
    cy.get('[data-test-id=from-unit-select]').select('ft');
    cy.get('[data-test-id=to-unit-select]').select('m');
    cy.get('[data-test-id=value-input]').clear().type('10', { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=unit-output]').should('be.visible');
    cy.get('[data-test-id=unit-output] .result-text').should('not.have.text', '');
    cy.get('[data-test-id=placeholder-message]').should('not.exist');
  });

  it('swaps units', () => {
    cy.get('[data-test-id=from-unit-select]').select('ft');
    cy.get('[data-test-id=to-unit-select]').select('m');
    cy.get('[data-test-id=swap-btn]').click();
    cy.get('[data-test-id=from-unit-select]').should('have.value', 'm');
    cy.get('[data-test-id=to-unit-select]').should('have.value', 'ft');
  });

  it('clears output', () => {
    cy.get('[data-test-id=value-input]').clear().type('10', { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=clear-btn]').click();
    cy.get('[data-test-id=unit-output]').should('not.exist');
    cy.get('[data-test-id=placeholder-message]').should('be.visible');
  });

  it('copies converted value to clipboard', () => {
    cy.window().then(win => {
      cy.stub(win.navigator.clipboard, 'writeText').as('writeText');
    });
    cy.get('[data-test-id=value-input]').clear().type('10', { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=copy-btn]').click();
    cy.get('[data-test-id=unit-output] .result-text').invoke('text').then(text => {
      cy.get('@writeText').should('have.been.calledWith', text);
    });
  });
}); 