// Cypress E2E test for RandomNumbers.vue
// Covers: generating, clearing, copying, and UI state

describe('Random Numbers Component', () => {
  beforeEach(() => {
    cy.visit('/randomnumbers');
  });

  it('shows placeholder initially', () => {
    cy.get('[data-test-id=min-input]').should('exist');
    cy.get('[data-test-id=numbers-output]').should('not.exist');
    cy.get('[data-test-id=placeholder-message]').should('be.visible');
  });

  it('generates random numbers', () => {
    cy.get('[data-test-id=min-input]').clear().type('10', { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=max-input]').clear().type('20', { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=quantity-input]').clear().type('3', { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=generate-btn]').click();
    cy.get('[data-test-id=numbers-output]').should('be.visible');
    cy.get('[data-test-id=numbers-output] .number-item').should('have.length', 3);
    cy.get('[data-test-id=placeholder-message]').should('not.exist');
  });

  it('clears output', () => {
    cy.get('[data-test-id=generate-btn]').click();
    cy.get('[data-test-id=clear-btn]').click();
    cy.get('[data-test-id=numbers-output]').should('not.exist');
    cy.get('[data-test-id=placeholder-message]').should('be.visible');
  });

  it('copies a number to clipboard', () => {
    cy.window().then(win => {
      cy.stub(win.navigator.clipboard, 'writeText').as('writeText');
    });
    cy.get('[data-test-id=generate-btn]').click();
    cy.get('[data-test-id=numbers-output] .number-item').first().then($item => {
      const number = $item.find('.number-value').text();
      cy.get(`[data-test-id=copy-btn-${number}]`).click();
      cy.get('@writeText').should('have.been.calledWith', number);
    });
  });

  it('disables clear button appropriately', () => {
    cy.get('[data-test-id=clear-btn]').should('be.disabled');
    cy.get('[data-test-id=generate-btn]').click();
    cy.get('[data-test-id=clear-btn]').should('not.be.disabled');
    cy.get('[data-test-id=clear-btn]').click();
    cy.get('[data-test-id=clear-btn]').should('be.disabled');
  });
}); 