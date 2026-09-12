describe('theme preference', () => {
  it('cycles and persists the theme preference', () => {
    cy.visit('/', { onBeforeLoad(win) { win.localStorage.removeItem('theme') } })
    cy.get('html').should('have.attr', 'data-theme-mode', 'dark')
    cy.get('[data-test-id=theme-toggle]').click()
    cy.get('html').should('have.attr', 'data-theme-mode', 'light')
    cy.reload()
    cy.get('html').should('have.attr', 'data-theme-mode', 'light')
  })
})
