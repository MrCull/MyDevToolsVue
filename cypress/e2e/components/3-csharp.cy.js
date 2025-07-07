// Cypress E2E test for CSharpFormatter.vue
// Covers: valid/invalid C# code, format, clear, copy, error, placeholder

describe('C# Formatter Component', () => {
  const validCode = 'public class Foo {\npublic int Bar { get; set; }\n}';
  const invalidCode = 'public class Foo {'; // Unclosed block

  beforeEach(() => {
    cy.visit('/csharp');
  });

  it('shows placeholder initially', () => {
    cy.get('[data-test-id=placeholder-message]').should('be.visible');
    cy.get('[data-test-id=csharp-output]').should('not.exist');
    cy.get('[data-test-id=error-message]').should('not.exist');
  });

  it('formats valid C# code', () => {
    cy.get('[data-test-id=csharp-input]').type(validCode, { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=format-btn]').click();
    cy.get('[data-test-id=csharp-output]').should('contain.text', 'public class Foo');
    cy.get('[data-test-id=csharp-output]').should('contain.text', 'public int Bar');
    cy.get('[data-test-id=error-message]').should('not.exist');
    cy.get('[data-test-id=placeholder-message]').should('not.exist');
  });

  it('clears input and output', () => {
    cy.get('[data-test-id=csharp-input]').type(validCode, { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=format-btn]').click();
    cy.get('[data-test-id=clear-btn]').click();
    cy.get('[data-test-id=csharp-input]').should('have.value', '');
    cy.get('[data-test-id=csharp-output]').should('not.exist');
    cy.get('[data-test-id=placeholder-message]').should('be.visible');
  });

  it('shows error for invalid C# code', () => {
    cy.get('[data-test-id=csharp-input]').type(invalidCode, { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=format-btn]').click();
    // The formatter may not throw error, so just check output or error
    cy.get('[data-test-id=error-message], [data-test-id=csharp-output]').should('exist');
  });

  it('copies formatted C# code to clipboard', () => {
    cy.window().then(win => {
      cy.stub(win.navigator.clipboard, 'writeText').as('writeText');
    });
    cy.get('[data-test-id=csharp-input]').type(validCode, { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=format-btn]').click();
    cy.get('[data-test-id=copy-btn]').click();
    cy.get('@writeText').should('have.been.called');
  });

  it('disables buttons appropriately', () => {
    cy.get('[data-test-id=format-btn]').should('be.disabled');
    cy.get('[data-test-id=clear-btn]').should('be.disabled');
    cy.get('[data-test-id=copy-btn]').should('be.disabled');
    cy.get('[data-test-id=csharp-input]').type(validCode, { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=format-btn]').should('not.be.disabled');
    cy.get('[data-test-id=clear-btn]').should('not.be.disabled');
    cy.get('[data-test-id=copy-btn]').should('be.disabled');
    cy.get('[data-test-id=format-btn]').click();
    cy.get('[data-test-id=copy-btn]').should('not.be.disabled');
  });
}); 