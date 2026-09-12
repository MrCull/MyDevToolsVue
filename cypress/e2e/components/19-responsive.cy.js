describe('responsive attached tabs', () => {
  ;['/json', '/guid', '/todo'].forEach((path) => {
    it(`keeps ${path} usable on mobile`, () => {
      cy.viewport(375, 720)
      cy.visit(path)
      cy.get('.tool-surface').should('be.visible')
      cy.get('h1').should('be.visible')
    })
  })
})
