// Cypress E2E test for TimeZoneConverter.vue
// Covers: searching, adding, removing, and clearing time zones

describe('Time Zone Converter Component', () => {
  beforeEach(() => {
    cy.visit('/timezone');
  });

  it('shows search input and no timezones initially', () => {
    cy.get('[data-test-id=timezone-search-input]').should('exist');
    cy.get('[data-test-id^=timezone-card-]').should('not.exist');
  });

  it('searches and adds a timezone', () => {
    cy.get('[data-test-id=timezone-search-input]').type('Tokyo', { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=timezone-search-results]').should('be.visible');
    cy.get('[data-test-id^=timezone-search-result-]').first().click();
    cy.get('[data-test-id^=timezone-card-]').should('have.length.at.least', 1);
  });

  it('removes a timezone', () => {
    cy.get('[data-test-id=timezone-search-input]').type('Tokyo', { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id^=timezone-search-result-]').first().click();
    cy.get('[data-test-id^=timezone-card-]').should('have.length.at.least', 1);
    cy.get('[data-test-id^=remove-btn-]').first().click();
    cy.get('[data-test-id^=timezone-card-]').should('not.exist');
  });

  it('adds multiple and clears all', () => {
    cy.get('[data-test-id=timezone-search-input]').type('Tokyo', { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id^=timezone-search-result-]').first().click();
    cy.get('[data-test-id=timezone-search-input]').clear().type('London', { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=timezone-search-input]').focus();
    cy.get('[data-test-id^=timezone-search-result-]').first().click();
    cy.get('[data-test-id^=timezone-card-]').should('have.length.at.least', 2);
    cy.get('[data-test-id=clear-all-btn]').click();
    cy.get('[data-test-id^=timezone-card-]').should('not.exist');
  });
});
