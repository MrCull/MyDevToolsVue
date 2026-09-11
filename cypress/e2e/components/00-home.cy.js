/// <reference types="cypress" />

describe('Developer workspace dashboard', () => {
  beforeEach(() => cy.visit('/'))

  it('shows the dashboard and grouped tool cards', () => {
    cy.url().should('match', /\/$/)
    cy.contains('h1', 'Developer tools, ready when you are.').should('be.visible')
    cy.contains('h2', 'Formatters').should('be.visible')
    cy.get('[data-test-id=tool-card-json]').should('be.visible')
  })

  it('filters tools and navigates from a card', () => {
    cy.get('[data-test-id=tool-search]').type('password')
    cy.get('[data-test-id=tool-card-password]').should('be.visible')
    cy.get('[data-test-id=tool-card-json]').should('not.exist')
    cy.get('[data-test-id=tool-card-password]').click()
    cy.url().should('include', '/password')
  })

  it('provides a no-results state', () => {
    cy.get('[data-test-id=tool-search]').type('not-a-tool')
    cy.get('[data-test-id=no-search-results]').should('be.visible')
  })
})
