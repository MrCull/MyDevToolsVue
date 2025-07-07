// Cypress E2E test for ContainerGenerator.vue
// Covers: generating, clearing, copying, and UI state

describe('Container Generator Component', () => {
  beforeEach(() => {
    cy.visit('/container');
  });

  it('shows placeholder initially', () => {
    cy.get('[data-test-id=owner-code-input]').should('exist');
    cy.get('[data-test-id=container-output]').should('not.exist');
    cy.get('[data-test-id=placeholder-message]').should('be.visible');
  });

  it('generates container numbers', () => {
    cy.get('[data-test-id=owner-code-input]').clear().type('MSC', { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=category-select]').select('U');
    cy.get('[data-test-id=quantity-input]').clear().type('3', { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=generate-btn]').click();
    cy.get('[data-test-id=container-output]').should('be.visible');
    cy.get('[data-test-id=container-output] .container-item').should('have.length', 3);
    cy.get('[data-test-id=placeholder-message]').should('not.exist');
  });

  it('clears output', () => {
    cy.get('[data-test-id=owner-code-input]').clear().type('MSC', { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=generate-btn]').click();
    cy.get('[data-test-id=clear-btn]').click();
    cy.get('[data-test-id=container-output]').should('not.exist');
    cy.get('[data-test-id=placeholder-message]').should('be.visible');
  });

  it('copies a container number to clipboard', () => {
    cy.window().then(win => {
      cy.stub(win.navigator.clipboard, 'writeText').as('writeText');
    });
    cy.get('[data-test-id=owner-code-input]').clear().type('MSC', { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=generate-btn]').click();
    cy.get('[data-test-id=container-output] .container-item').first().then($item => {
      const number = $item.find('.container-number').text();
      cy.get(`[data-test-id=copy-btn-${number}]`).click();
      cy.get('@writeText').should('have.been.calledWith', number);
    });
  });

  it('disables buttons appropriately', () => {
    cy.get('[data-test-id=generate-btn]').should('be.disabled');
    cy.get('[data-test-id=clear-btn]').should('be.disabled');
    cy.get('[data-test-id=owner-code-input]').clear().type('MSC', { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=generate-btn]').should('not.be.disabled');
    cy.get('[data-test-id=clear-btn]').should('be.disabled');
    cy.get('[data-test-id=generate-btn]').click();
    cy.get('[data-test-id=clear-btn]').should('not.be.disabled');
  });
}); 