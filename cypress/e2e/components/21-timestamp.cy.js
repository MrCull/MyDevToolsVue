describe('Unix Timestamp Converter', () => {
  beforeEach(() => {
    cy.clock(Date.UTC(2026, 0, 1));
    cy.visit('/timestamp');
  });

  it('shows the frozen current epoch', () => {
    cy.get('[data-test-id=timestamp-now-seconds]').should('contain.text', '1767225600');
  });

  it('converts seconds to UTC and a local date', () => {
    cy.get('[data-test-id=timestamp-input]').type('1767225600');
    cy.get('[data-test-id=timestamp-iso]').should('contain.text', '2026-01-01T00:00:00.000Z');
    cy.get('[data-test-id=timestamp-local]').should('not.be.empty');
  });

  it('auto-detects milliseconds', () => {
    cy.get('[data-test-id=timestamp-input]').type('1767225600000');
    cy.get('[data-test-id=timestamp-unit]').should('have.value', 'auto');
    cy.contains('Detected: milliseconds').should('be.visible');
    cy.get('[data-test-id=timestamp-iso]').should('contain.text', '2026-01-01T00:00:00.000Z');
  });

  it('swaps the placeholder for an error on invalid input', () => {
    cy.get('[data-test-id=timestamp-placeholder]').should('be.visible');
    cy.get('[data-test-id=timestamp-input]').type('abc');
    cy.get('[data-test-id=timestamp-error]').should('be.visible');
    cy.get('[data-test-id=timestamp-placeholder]').should('not.exist');
  });
});
