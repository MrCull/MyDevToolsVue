// Cypress E2E test for ToDoList.vue
// Covers: adding, completing, filtering, deleting, and clearing tasks

describe('To Do List Component', () => {
  beforeEach(() => {
    cy.visit('/todo');
    cy.get('[data-test-id=task-input]').clear();
  });

  it('adds a new task', () => {
    cy.get('[data-test-id=task-input]').type('Test Task 1', { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=add-btn]').click();
    cy.get('[data-test-id=task-list]').should('contain.text', 'Test Task 1');
  });

  it('completes and uncompletes a task', () => {
    cy.get('[data-test-id=task-input]').type('Test Task 2', { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=add-btn]').click();
    cy.get('[data-test-id^=task-checkbox-]').last().check({ force: true });
    cy.get('[data-test-id^=task-desc-]').last().should('have.class', 'completed');
    cy.get('[data-test-id^=task-checkbox-]').last().uncheck({ force: true });
    cy.get('[data-test-id^=task-desc-]').last().should('not.have.class', 'completed');
  });

  it('filters active and completed tasks', () => {
    cy.get('[data-test-id=task-input]').type('Active Task', { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=add-btn]').click();
    cy.get('[data-test-id=task-input]').type('Completed Task', { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=add-btn]').click();
    cy.get('[data-test-id^=task-checkbox-]').last().check({ force: true });
    cy.get('[data-test-id=filter-active-checkbox]').uncheck({ force: true });
    cy.get('[data-test-id=task-list]').should('not.contain.text', 'Active Task');
    cy.get('[data-test-id=filter-completed-checkbox]').check({ force: true });
    cy.get('[data-test-id=task-list]').should('contain.text', 'Completed Task');
  });

  it('deletes a task', () => {
    cy.get('[data-test-id=task-input]').type('Delete Me', { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=add-btn]').click();
    cy.get('[data-test-id^=remove-task-btn-]').last().click();
    cy.get('[data-test-id=task-list]').should('not.contain.text', 'Delete Me');
  });

  it('deletes completed tasks', () => {
    cy.get('[data-test-id=task-input]').type('Complete and Delete', { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=add-btn]').click();
    cy.get('[data-test-id^=task-checkbox-]').last().check({ force: true });
    cy.get('[data-test-id=filter-completed-checkbox]').check({ force: true });
    cy.get('[data-test-id=delete-completed-btn]').click();
    cy.get('[data-test-id=task-list]').should('not.contain.text', 'Complete and Delete');
  });
}); 