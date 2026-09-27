describe('Encoder / Decoder', () => {
  beforeEach(() => cy.visit('/encode'))
  it('round-trips UTF-8 through Base64', () => {
    cy.get('[data-test-id="encode-input"]').type('héllo 👋')
    cy.get('[data-test-id="encode-output"]').invoke('text').then((encoded) => {
      cy.get('[data-test-id="encode-direction-decode"]').click()
      cy.get('[data-test-id="encode-input"]').clear().type(encoded)
      cy.get('[data-test-id="encode-output"]').should('have.text', 'héllo 👋')
    })
  })
  it('supports Base64URL, URL component, and HTML encoding', () => {
    cy.get('[data-test-id="encode-mode"]').select('base64url')
    cy.get('[data-test-id="encode-input"]').type('héllo 👋')
    cy.get('[data-test-id="encode-output"]').invoke('text').should('not.match', /[+/=]/)
    cy.get('[data-test-id="encode-mode"]').select('component')
    cy.get('[data-test-id="encode-input"]').clear().type('a b&c')
    cy.get('[data-test-id="encode-output"]').should('have.text', 'a%20b%26c')
    cy.get('[data-test-id="encode-mode"]').select('html')
    cy.get('[data-test-id="encode-input"]').clear().type('<b>', { parseSpecialCharSequences: false })
    cy.get('[data-test-id="encode-output"]').should('have.text', '&lt;b&gt;')
  })
  it('reports malformed input without stale output', () => {
    cy.get('[data-test-id="encode-direction-decode"]').click()
    cy.get('[data-test-id="encode-input"]').type('not base64!')
    cy.get('[data-test-id="encode-error"]').should('be.visible')
    cy.get('[data-test-id="encode-output"]').should('not.exist')
  })
  it('swaps output and flips direction', () => {
    cy.get('[data-test-id="encode-input"]').type('hello')
    cy.get('[data-test-id="encode-output"]').invoke('text').then((encoded) => {
      cy.get('[data-test-id="encode-swap"]').click()
      cy.get('[data-test-id="encode-direction-decode"]').should('have.attr', 'aria-pressed', 'true')
      cy.get('[data-test-id="encode-input"]').should('have.value', encoded)
    })
  })
  it('reads a file as a data URI', () => {
    cy.get('[data-test-id="encode-file"]').selectFile({ contents: Cypress.Buffer.from('hello'), fileName: 'hello.txt', mimeType: 'text/plain' })
    cy.get('[data-test-id="encode-output"]').should('contain.text', 'data:text/plain;base64,')
  })
})
