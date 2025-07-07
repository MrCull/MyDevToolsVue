// Cypress E2E test for BranchFormatter.vue
// Covers: formatting, clearing, copying, and UI state

describe('Branch Formatter Component', () => {
  const inputText = 'Story 123456: Add new feature!';
  const expectedOutput = '123456_Add_new_feature';

  beforeEach(() => {
    cy.visit('/branch');
    cy.get('[data-test-id=clear-btn]').click();
  });

  it('Shows placeholder initially', () => {
    cy.get('[data-test-id=branch-input]').should('exist');
    cy.get('[data-test-id=branch-output]').should('not.exist');
    cy.get('[data-test-id=placeholder-message]').should('be.visible');
  });

  it('formats branch name', () => {
    cy.get('[data-test-id=branch-input]').clear().type(inputText, { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=format-btn]').click();
    cy.get('[data-test-id=branch-output]').should('contain.text', expectedOutput);
    cy.get('[data-test-id=placeholder-message]').should('not.exist');
  });

  it('clears output', () => {
    cy.get('[data-test-id=branch-input]').clear().type(inputText, { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=format-btn]').click();
    cy.get('[data-test-id=clear-btn]').click();
    cy.get('[data-test-id=branch-input]').should('have.value', '');
    cy.get('[data-test-id=branch-output]').should('not.exist');
    cy.get('[data-test-id=placeholder-message]').should('be.visible');
  });

  it('copies formatted branch name to clipboard', () => {
    cy.window().then(win => {
      cy.stub(win.navigator.clipboard, 'writeText').as('writeText');
    });
    cy.get('[data-test-id=branch-input]').clear().type(inputText, { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=format-btn]').click();
    cy.get('[data-test-id=copy-btn]').click();
    cy.get('@writeText').should('have.been.calledWith', expectedOutput);
  });

  it('disables buttons appropriately', () => {
    cy.get('[data-test-id=format-btn]').should('be.disabled');
    cy.get('[data-test-id=clear-btn]').should('be.disabled');
    cy.get('[data-test-id=branch-input]').clear().type(inputText, { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=format-btn]').should('not.be.disabled');
    cy.get('[data-test-id=clear-btn]').should('be.disabled');
    cy.get('[data-test-id=format-btn]').click();
    cy.get('[data-test-id=clear-btn]').should('not.be.disabled');
  });
});
