describe('Markdown previewer', () => {
  beforeEach(() => cy.visit('/markdown'))

  it('renders Markdown and GFM tables', () => {
    cy.get('[data-test-id="markdown-input"]').type('# Hi')
    cy.get('[data-test-id="markdown-preview"] h1').should('have.text', 'Hi')
    cy.get('[data-test-id="markdown-input"]').clear().invoke('val', '| A |\n| --- |\n| B |').trigger('input')
    cy.get('[data-test-id="markdown-preview"] table').should('exist')
  })

  it('sanitizes untrusted HTML', () => {
    cy.get('[data-test-id="markdown-input"]').invoke('val', '<img src=x onerror="window.__xss=1"><script>window.__xss=2</script>').trigger('input')
    cy.get('[data-test-id="markdown-preview"] script').should('not.exist')
    cy.window().its('__xss').should('be.undefined')
  })

  it('loads a sample and copies sanitized HTML', () => {
    cy.window().then((win) => cy.stub(win.navigator.clipboard, 'writeText').as('copy'))
    cy.get('[data-test-id="markdown-sample"]').click()
    cy.get('[data-test-id="markdown-input"]').should('contain.value', 'Markdown sample')
    cy.get('[data-test-id="markdown-copy-html"]').click()
    cy.get('@copy').should('have.been.calledWithMatch', /<h1/)
  })
})
