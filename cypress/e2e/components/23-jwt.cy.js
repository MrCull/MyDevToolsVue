describe('JWT Decoder', () => {
  beforeEach(() => { cy.fixture('jwt-tokens').as('tokens'); cy.visit('/jwt') })
  const paste = (token) => cy.get('[data-test-id="jwt-input"]').invoke('val', token).trigger('input')
  it('decodes an expired token', function () {
    paste(this.tokens.expired)
    cy.get('[data-test-id="jwt-payload-output"]').should('contain.text', '"sub"')
    cy.get('[data-test-id="jwt-status"]').should('have.text', 'Expired')
    cy.get('[data-test-id="jwt-claim-exp"]').should('contain.text', '2001-01-01')
  })
  it('detects a valid future token', function () { paste(this.tokens.valid); cy.get('[data-test-id="jwt-status"]').should('have.text', 'Valid') })
  it('accepts a Bearer prefix', function () { paste(`Bearer ${this.tokens.valid}`); cy.get('[data-test-id="jwt-payload-output"]').should('contain.text', 'future-user') })
  it('shows errors and the empty placeholder', () => {
    cy.get('[data-test-id="jwt-placeholder"]').should('be.visible')
    paste('abc')
    cy.get('[data-test-id="jwt-error"]').should('have.text', 'Not a JWT')
  })
})
