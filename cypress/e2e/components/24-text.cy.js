describe('Text Case and Line Tools', () => {
  beforeEach(() => cy.visit('/text'));

  it('converts words between common cases', () => {
    cy.get('[data-test-id=text-input]').type('my HTTP server_name');
    cy.get('[data-test-id=text-case-camel] [data-test-id=result-value]').should('have.text', 'myHttpServerName');
    cy.get('[data-test-id=text-case-snake] [data-test-id=result-value]').should('have.text', 'my_http_server_name');
    cy.get('[data-test-id=text-case-kebab] [data-test-id=result-value]').should('have.text', 'my-http-server-name');
  });

  it('reports live word statistics', () => {
    cy.get('[data-test-id=text-input]').type('hello world');
    cy.get('[data-test-id=text-stat-words]').should('contain.text', '2');
  });

  it('sorts, deduplicates, and undoes destructive changes', () => {
    cy.get('[data-test-id=text-input]').type('b\na\nc');
    cy.get('[data-test-id=text-line-sort]').click();
    cy.get('[data-test-id=text-input]').should('have.value', 'a\nb\nc');
    cy.get('[data-test-id=text-undo]').click();
    cy.get('[data-test-id=text-input]').should('have.value', 'b\na\nc');
    cy.get('[data-test-id=text-input]').clear().type('a\na\nb');
    cy.get('[data-test-id=text-line-dedupe]').click();
    cy.get('[data-test-id=text-input]').should('have.value', 'a\nb');
  });

  it('sorts numbered lines naturally', () => {
    cy.get('[data-test-id=text-input]').type('item10\nitem2');
    cy.get('[data-test-id=text-natural-sort]').check();
    cy.get('[data-test-id=text-line-sort]').click();
    cy.get('[data-test-id=text-input]').should('have.value', 'item2\nitem10');
  });
});
