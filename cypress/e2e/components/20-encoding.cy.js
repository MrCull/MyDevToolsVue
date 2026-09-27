const paths = ['/', '/json', '/sql', '/csharp', '/diff', '/branch', '/regex', '/text', '/markdown', '/container', '/guid', '/password', '/hash', '/qrcode', '/cron', '/randomnumbers', '/fakedata', '/timezone', '/numberbase', '/unit', '/timestamp', '/encode', '/jwt', '/color', '/dataconvert', '/todo']
const mojibake = /[À-ÿ][\u0080-\u00bf\u2000-\u20ffŒ-ƒˆ-˜]|�/

describe('text encoding', () => {
  paths.forEach((path) => {
    it(`renders clean text on ${path}`, () => {
      cy.visit(path)
      cy.get('body').invoke('text').should('not.match', mojibake)
    })
  })

  it('renders accessible unit actions', () => {
    cy.visit('/unit')
    cy.get('[data-test-id="swap-btn"]').should('have.text', 'Swap Units')
    cy.get('[data-test-id="from-unit-info"]').should('have.attr', 'aria-label').and('match', /^About /)
    cy.get('[data-test-id="to-unit-info"]').should('have.attr', 'aria-label').and('match', /^About /)
  })

  it('renders the todo remove icon accessibly', () => {
    cy.visit('/todo')
    cy.get('[data-test-id="task-input"]').type('Encoding check')
    cy.get('[data-test-id="add-btn"]').click()
    cy.get('[data-test-id^="remove-task-btn-"]').should('have.attr', 'aria-label', 'Remove task')
  })
})
