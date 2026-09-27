describe('Fake Data Generator', () => {
  beforeEach(() => cy.visit('/fakedata'))

  it('generates repeatable lorem ipsum', () => {
    cy.get('[data-test-id="fakedata-placeholder"]').should('be.visible')
    cy.get('[data-test-id="fakedata-lorem-count"]').clear().type('3')
    cy.get('[data-test-id="fakedata-generate"]').click()
    cy.get('[data-test-id="fakedata-output"]').invoke('text').then((value) => expect(value.split('\n\n')).to.have.length(3))
    cy.get('[data-test-id="fakedata-output"]').should('have.text').and('match', /^Lorem ipsum dolor sit amet/)
    cy.get('[data-test-id="fakedata-output"]').invoke('text').then((first) => {
      cy.get('[data-test-id="fakedata-generate"]').click()
      cy.get('[data-test-id="fakedata-output"]').should('have.text', first)
    })
  })

  it('generates selected JSON fields and reserved email addresses', () => {
    cy.get('[data-test-id="fakedata-mode"]').select('records')
    cy.get('[data-test-id^="fakedata-field-"]').uncheck()
    cy.get('[data-test-id="fakedata-field-fullName"]').check()
    cy.get('[data-test-id="fakedata-field-email"]').check()
    cy.get('[data-test-id="fakedata-rows"]').clear().type('5')
    cy.get('[data-test-id="fakedata-generate"]').click()
    cy.get('[data-test-id="fakedata-output"]').invoke('text').then((value) => {
      const records = JSON.parse(value)
      expect(records).to.have.length(5)
      records.forEach((record) => {
        expect(record).to.have.all.keys('fullName', 'email')
        expect(record.email).to.match(/@example\.(com|org|net)$/)
      })
    })
  })

  it('keeps seeded records deterministic and generates SQL', () => {
    cy.get('[data-test-id="fakedata-mode"]').select('records')
    cy.get('[data-test-id="fakedata-seed"]').clear().type('42')
    cy.get('[data-test-id="fakedata-generate"]').click()
    cy.get('[data-test-id="fakedata-output"]').invoke('text').then((first) => {
      cy.get('[data-test-id="fakedata-generate"]').click()
      cy.get('[data-test-id="fakedata-output"]').should('have.text', first)
    })
    cy.get('[data-test-id="fakedata-format"]').select('sql')
    cy.get('[data-test-id="fakedata-generate"]').click()
    cy.get('[data-test-id="fakedata-output"]').should('have.text').and('match', /^INSERT INTO/)
  })
})
