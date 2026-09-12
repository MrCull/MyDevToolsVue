describe('attached tool navigation', () => {
  it('uses route-backed category and tool links', () => {
    cy.visit('/json')
    cy.contains('nav', 'Formatters').should('be.visible')
    cy.get('[aria-current=page]').should('contain.text', 'JSON')
    cy.contains('a', 'SQL').click()
    cy.location('pathname').should('eq', '/sql')
    cy.get('[aria-current=page]').should('contain.text', 'SQL')
  })

  it('keeps deep links directly reachable', () => {
    cy.visit('/guid')
    cy.contains('h1', 'GUID Generator').should('be.visible')
  })
})
