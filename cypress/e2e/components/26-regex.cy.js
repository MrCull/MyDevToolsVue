describe('Regex Tester', () => {
  beforeEach(() => cy.visit('/regex'))

  it('finds global matches and switches to a single match', () => {
    cy.get('[data-test-id="regex-pattern"]').type('\\d+', { delay: 0, parseSpecialCharSequences: false })
    cy.get('[data-test-id="regex-test-input"]').type('a1b22c333', { delay: 0 })
    cy.get('[data-test-id="regex-match-count"]').should('have.text', '3 matches')
    cy.get('[data-test-id="regex-flag-g"]').uncheck()
    cy.get('[data-test-id="regex-match-count"]').should('have.text', '1 match')
  })

  it('shows named groups and supports ignore case', () => {
    cy.get('[data-test-id="regex-pattern"]').type('(?<year>\\d{4})', { delay: 0, parseSpecialCharSequences: false })
    cy.get('[data-test-id="regex-test-input"]').type('Released 2026', { delay: 0 })
    cy.get('[data-test-id="regex-match-table"]').should('contain.text', 'year').and('contain.text', '2026')
    cy.get('[data-test-id="regex-pattern"]').clear().type('ABC')
    cy.get('[data-test-id="regex-test-input"]').clear().type('abc')
    cy.get('[data-test-id="regex-flag-i"]').check()
    cy.get('[data-test-id="regex-match-count"]').should('have.text', '1 match')
  })

  it('reports compile errors and previews replacements', () => {
    cy.get('[data-test-id="regex-pattern"]').type('[', { parseSpecialCharSequences: false })
    cy.get('[data-test-id="regex-error"]').should('be.visible')
    cy.get('[data-test-id="regex-pattern"]').clear().type('(\\w+)@(\\w+)', { delay: 0, parseSpecialCharSequences: false })
    cy.get('[data-test-id="regex-test-input"]').type('alice@example', { delay: 0 })
    cy.get('[data-test-id="regex-replace-input"]').type('$2 at $1')
    cy.get('[data-test-id="regex-replace-output"]').should('have.text', 'example at alice')
  })

  it('interrupts catastrophic backtracking and remains responsive', () => {
    cy.get('[data-test-id="regex-pattern"]').type('(a+)+$', { delay: 0, parseSpecialCharSequences: false })
    cy.get('[data-test-id="regex-test-input"]').invoke('val', `${'a'.repeat(30)}!`).trigger('input')
    cy.get('[data-test-id="regex-timeout"]', { timeout: 3000 }).should('be.visible')
    cy.get('[data-test-id="regex-pattern"]').clear().type('safe').should('have.value', 'safe')
  })
})
