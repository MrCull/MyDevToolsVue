// Cypress E2E test for GuidGenerator.vue
// Covers: generating, clearing, copying, and UI state

describe('GUID Generator Component', () => {
  beforeEach(() => {
    cy.visit('/guid');
  });

  it('shows placeholder initially', () => {
    cy.get('[data-test-id=format-select]').should('exist');
    cy.get('[data-test-id=guid-output]').should('not.exist');
    cy.get('[data-test-id=placeholder-message]').should('be.visible');
  });

  it('generates GUIDs', () => {
    cy.get('[data-test-id=format-select]').select('default');
    cy.get('[data-test-id=quantity-input]').clear().type('3', { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=generate-btn]').click();
    cy.get('[data-test-id=guid-output]').should('be.visible');
    cy.get('[data-test-id=guid-output] .container-item').should('have.length', 3);
    cy.get('[data-test-id=placeholder-message]').should('not.exist');
  });

  it('clears output', () => {
    cy.get('[data-test-id=generate-btn]').click();
    cy.get('[data-test-id=clear-btn]').click();
    cy.get('[data-test-id=guid-output]').should('not.exist');
    cy.get('[data-test-id=placeholder-message]').should('be.visible');
  });

  it('copies a GUID to clipboard', () => {
    cy.window().then(win => {
      cy.stub(win.navigator.clipboard, 'writeText').as('writeText');
    });
    cy.get('[data-test-id=generate-btn]').click();
    cy.get('[data-test-id=guid-output] .container-item').first().then($item => {
      const guid = $item.find('.container-number').text();
      cy.get(`[data-test-id=copy-btn-${guid}]`).click();
      cy.get('@writeText').should('have.been.calledWith', guid);
    });
  });

  it('disables buttons appropriately', () => {
    cy.get('[data-test-id=clear-btn]').should('be.disabled');
    cy.get('[data-test-id=generate-btn]').should('not.be.disabled');
    cy.get('[data-test-id=generate-btn]').click();
    cy.get('[data-test-id=clear-btn]').should('not.be.disabled');
  });
}); 