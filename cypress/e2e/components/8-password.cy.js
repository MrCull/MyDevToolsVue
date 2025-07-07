// Cypress E2E test for PasswordGenerator.vue
// Covers: generating, clearing, copying, and UI state

describe('Password Generator Component', () => {
  beforeEach(() => {
    cy.visit('/password');
  });

  it('shows placeholder initially', () => {
    cy.get('[data-test-id=length-range]').should('exist');
    cy.get('[data-test-id=password-output]').should('not.exist');
    cy.get('[data-test-id=placeholder-message]').should('be.visible');
  });

  it('generates passwords', () => {
    cy.get('[data-test-id=length-range]').invoke('val', 12).trigger('input');
    cy.get('[data-test-id=quantity-input]').clear().type('3', { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=generate-btn]').click();
    cy.get('[data-test-id=password-output]').should('be.visible');
    cy.get('[data-test-id=password-output] .password-item').should('have.length', 3);
    cy.get('[data-test-id=placeholder-message]').should('not.exist');
  });

  it('clears output', () => {
    cy.get('[data-test-id=generate-btn]').click();
    cy.get('[data-test-id=clear-btn]').click();
    cy.get('[data-test-id=password-output]').should('not.exist');
    cy.get('[data-test-id=placeholder-message]').should('be.visible');
  });

  it('copies a password to clipboard', () => {
    cy.window().then(win => {
      cy.stub(win.navigator.clipboard, 'writeText').as('writeText');
    });
    cy.get('[data-test-id=generate-btn]').click();
    cy.get('[data-test-id=password-output] .password-item').first().then($item => {
      const password = $item.find('.password-text').text();
      cy.get(`[data-test-id=copy-btn-${password}]`).click();
      cy.get('@writeText').should('have.been.calledWith', password);
    });
  });

  it('disables buttons appropriately', () => {
    cy.get('[data-test-id=clear-btn]').should('be.disabled');
    cy.get('[data-test-id=generate-btn]').should('not.be.disabled');
    cy.get('[data-test-id=generate-btn]').click();
    cy.get('[data-test-id=clear-btn]').should('not.be.disabled');
  });

  it('toggles character type checkboxes', () => {
    cy.get('[data-test-id=uppercase-checkbox]').uncheck({ force: true });
    cy.get('[data-test-id=lowercase-checkbox]').uncheck({ force: true });
    cy.get('[data-test-id=numbers-checkbox]').uncheck({ force: true });
    cy.get('[data-test-id=symbols-checkbox]').uncheck({ force: true });
    cy.get('[data-test-id=generate-btn]').should('be.disabled');
    cy.get('[data-test-id=uppercase-checkbox]').check({ force: true });
    cy.get('[data-test-id=generate-btn]').should('not.be.disabled');
  });
}); 