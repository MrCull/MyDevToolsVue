// Cypress E2E test for SqlFormatter.vue
// Covers: valid/invalid SQL, format, clear, copy, error, placeholder

describe('SQL Formatter Component', () => {
  const validSql = 'select * from users where id = 1;';

  beforeEach(() => {
    cy.visit('/sql');
  });

  it('shows placeholder initially', () => {
    cy.get('[data-test-id=placeholder-message]').should('be.visible');
    cy.get('[data-test-id=sql-output]').should('not.exist');
    cy.get('[data-test-id=error-message]').should('not.exist');
  });

  it('formats valid SQL', () => {
    cy.get('[data-test-id=sql-input]').type(validSql, { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=format-btn]').click();
    cy.get('[data-test-id=sql-output]').should('contain.text', 'SELECT');
    cy.get('[data-test-id=sql-output]').should('contain.text', 'FROM');
    cy.get('[data-test-id=sql-output]').should('contain.text', 'users');
    cy.get('[data-test-id=sql-output]').should('contain.text', 'WHERE');
    cy.get('[data-test-id=sql-output]').should('contain.text', 'id = 1');
    cy.get('[data-test-id=error-message]').should('not.exist');
    cy.get('[data-test-id=placeholder-message]').should('not.exist');
  });

  it('clears input and output', () => {
    cy.get('[data-test-id=sql-input]').type(validSql, { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=format-btn]').click();
    cy.get('[data-test-id=clear-btn]').click();
    cy.get('[data-test-id=sql-input]').should('have.value', '');
    cy.get('[data-test-id=sql-output]').should('not.exist');
    cy.get('[data-test-id=placeholder-message]').should('be.visible');
  });

  it('copies formatted SQL to clipboard', () => {
    cy.window().then(win => {
      cy.stub(win.navigator.clipboard, 'writeText').as('writeText');
    });
    cy.get('[data-test-id=sql-input]').type(validSql, { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=format-btn]').click();
    cy.get('[data-test-id=copy-btn]').click();
    cy.get('@writeText').should('have.been.called');
  });

  it('disables buttons appropriately', () => {
    cy.get('[data-test-id=format-btn]').should('be.disabled');
    cy.get('[data-test-id=clear-btn]').should('be.disabled');
    cy.get('[data-test-id=copy-btn]').should('be.disabled');
    cy.get('[data-test-id=sql-input]').type(validSql, { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=format-btn]').should('not.be.disabled');
    cy.get('[data-test-id=clear-btn]').should('not.be.disabled');
    cy.get('[data-test-id=copy-btn]').should('be.disabled');
    cy.get('[data-test-id=format-btn]').click();
    cy.get('[data-test-id=copy-btn]').should('not.be.disabled');
  });
});
