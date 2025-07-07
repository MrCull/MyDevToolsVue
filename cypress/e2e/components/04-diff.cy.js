// Cypress E2E test for DiffTool.vue
// Covers: diffing, clearing, and UI state

describe('Diff Tool Component', () => {
  const originalText = 'Hello\nWorld';
  const modifiedText = 'Hello\nThere';

  beforeEach(() => {
    cy.visit('/diff');
  });

  it('shows empty state initially', () => {
    cy.get('[data-test-id=original-input]').should('have.value', '');
    cy.get('[data-test-id=modified-input]').should('have.value', '');
    cy.get('[data-test-id=diff-result]').should('not.exist');
  });

  it('compares and shows diff result', () => {
    cy.get('[data-test-id=original-input]').type(originalText, { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=modified-input]').type(modifiedText, { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=compare-btn]').click();
    cy.get('[data-test-id=diff-result]').should('be.visible');
    cy.get('[data-test-id=diff-result]').should('contain.text', 'World');
    cy.get('[data-test-id=diff-result]').should('contain.text', 'There');
  });

  it('clears original input', () => {
    cy.get('[data-test-id=original-input]').type(originalText, { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=clear-original-btn]').click();
    cy.get('[data-test-id=original-input]').should('have.value', '');
  });

  it('clears modified input', () => {
    cy.get('[data-test-id=modified-input]').type(modifiedText, { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=clear-modified-btn]').click();
    cy.get('[data-test-id=modified-input]').should('have.value', '');
  });

  it('clears all', () => {
    cy.get('[data-test-id=original-input]').type(originalText, { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=modified-input]').type(modifiedText, { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=clear-all-btn]').click();
    cy.get('[data-test-id=original-input]').should('have.value', '');
    cy.get('[data-test-id=modified-input]').should('have.value', '');
    cy.get('[data-test-id=diff-result]').should('not.exist');
  });

  it('disables buttons appropriately', () => {
    cy.get('[data-test-id=compare-btn]').should('be.disabled');
    cy.get('[data-test-id=clear-original-btn]').should('be.disabled');
    cy.get('[data-test-id=clear-modified-btn]').should('be.disabled');
    cy.get('[data-test-id=clear-all-btn]').should('be.disabled');
    cy.get('[data-test-id=original-input]').type(originalText, { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=compare-btn]').should('be.disabled');
    cy.get('[data-test-id=clear-original-btn]').should('not.be.disabled');
    cy.get('[data-test-id=clear-all-btn]').should('not.be.disabled');
    cy.get('[data-test-id=modified-input]').type(modifiedText, { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=compare-btn]').should('not.be.disabled');
    cy.get('[data-test-id=clear-modified-btn]').should('not.be.disabled');
    cy.get('[data-test-id=clear-all-btn]').should('not.be.disabled');
  });
}); 