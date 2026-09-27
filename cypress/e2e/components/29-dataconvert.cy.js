describe('Data format converter', () => {
  beforeEach(() => cy.visit('/dataconvert'))
  const input = (value) => cy.get('[data-test-id="dataconvert-input"]').invoke('val', value).trigger('input')

  it('converts JSON to YAML and shows tables for record arrays', () => {
    input('{"a":1,"b":[1,2]}')
    cy.get('[data-test-id="dataconvert-convert"]').click()
    cy.get('[data-test-id="dataconvert-output"]').should('contain.value', 'a: 1').and('contain.value', '- 1')
    input('[{"name":"Ada"}]')
    cy.get('[data-test-id="dataconvert-convert"]').click()
    cy.get('[data-test-id="dataconvert-table-tab"]').should('exist').click()
    cy.get('[data-test-id="dataconvert-table"]').should('contain.text', 'Ada')
  })

  it('quotes CSV cells and parses XML attributes', () => {
    cy.get('[data-test-id="dataconvert-to"]').select('csv')
    input('[{"n":"x, y"}]')
    cy.get('[data-test-id="dataconvert-convert"]').click()
    cy.get('[data-test-id="dataconvert-output"]').should('contain.value', '"x, y"')
    cy.get('[data-test-id="dataconvert-from"]').select('xml')
    cy.get('[data-test-id="dataconvert-to"]').select('json')
    input('<a id="1">t</a>')
    cy.get('[data-test-id="dataconvert-convert"]').click()
    cy.get('[data-test-id="dataconvert-output"]').should('contain.value', '@_id')
  })

  it('clears stale output on errors and swaps formats', () => {
    input('{"ok":true}')
    cy.get('[data-test-id="dataconvert-convert"]').click()
    cy.get('[data-test-id="dataconvert-swap"]').click()
    cy.get('[data-test-id="dataconvert-from"]').should('have.value', 'yaml')
    cy.get('[data-test-id="dataconvert-to"]').should('have.value', 'json')
    cy.get('[data-test-id="dataconvert-from"]').select('json')
    input('{bad')
    cy.get('[data-test-id="dataconvert-convert"]').click()
    cy.get('[data-test-id="dataconvert-error"]').should('exist')
    cy.get('[data-test-id="dataconvert-output"]').should('not.exist')
  })
})
