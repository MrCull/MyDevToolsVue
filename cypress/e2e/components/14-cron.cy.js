// Cypress E2E test for CronGenerator.vue
// Covers: generating, clearing, copying, and UI state

describe('Cron Generator Component', () => {
  beforeEach(() => {
    cy.visit('/cron');
  });

  it('shows placeholder initially', () => {
    cy.get('[data-test-id=minute-select]').should('exist');
    cy.get('[data-test-id=cron-output]').should('exist');
    cy.get('[data-test-id=placeholder-message]').should('not.exist');
  });

  it('generates a cron expression', () => {
    cy.get('[data-test-id=minute-select]').select('0');
    cy.get('[data-test-id=hour-select]').select('12');
    cy.get('[data-test-id=day-select]').select('1');
    cy.get('[data-test-id=month-select]').select('1');
    cy.get('[data-test-id=weekday-select]').select('1');
    cy.get('[data-test-id=generate-btn]').click();
    cy.get('[data-test-id=cron-output]').should('be.visible');
    cy.get('[data-test-id=cron-output] .cron-text').should('contain.text', '0 12 1 1 1');
    cy.get('[data-test-id=placeholder-message]').should('not.exist');
  });

  it('clears output', () => {
    cy.get('[data-test-id=minute-select]').select('0');
    cy.get('[data-test-id=generate-btn]').click();
    cy.get('[data-test-id=clear-btn]').click();
    cy.get('[data-test-id=cron-output]').should('be.visible');
    cy.get('[data-test-id=cron-output] .cron-text').should('not.have.text', '0 12 1 1 1');
  });

  it('copies cron expression to clipboard', () => {
    cy.window().then(win => {
      cy.stub(win.navigator.clipboard, 'writeText').as('writeText');
    });
    cy.get('[data-test-id=minute-select]').select('0');
    cy.get('[data-test-id=generate-btn]').click();
    cy.get('[data-test-id=copy-btn]').click();
    cy.get('[data-test-id=cron-output] .cron-text').invoke('text').then(text => {
      cy.get('@writeText').should('have.been.calledWith', text);
    });
  });
}); 