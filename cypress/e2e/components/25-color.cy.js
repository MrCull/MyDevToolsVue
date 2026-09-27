describe('Color Converter and Contrast Checker', () => {
  beforeEach(() => cy.visit('/color'));

  it('converts HEX and RGB values', () => {
    cy.get('[data-test-id=color-input]').clear().type('#ff0000');
    cy.get('[data-test-id=color-rgb]').should('contain.text', 'rgb(255, 0, 0)');
    cy.get('[data-test-id=color-hsl]').should('contain.text', 'hsl(0, 100%, 50%)');
    cy.get('[data-test-id=color-input]').clear().type('rgb(0,128,255)');
    cy.get('[data-test-id=color-hex]').should('contain.text', '#0080ff');
    cy.get('[data-test-id=color-input]').clear().type('#fff');
    cy.get('[data-test-id=color-hex]').should('contain.text', '#ffffff');
  });

  it('updates from the native picker', () => {
    cy.get('[data-test-id=color-picker]').invoke('val', '#00ff00').trigger('input');
    cy.get('[data-test-id=color-hex]').should('contain.text', '#00ff00');
  });

  it('evaluates accessible and edge-case contrast ratios', () => {
    cy.get('[data-test-id=contrast-ratio]').should('contain.text', '21.00');
    cy.get('[data-test-id=contrast-aa-normal]').should('contain.text', 'Pass');
    cy.get('[data-test-id=contrast-aa-large]').should('contain.text', 'Pass');
    cy.get('[data-test-id=contrast-aaa-normal]').should('contain.text', 'Pass');
    cy.get('[data-test-id=contrast-aaa-large]').should('contain.text', 'Pass');
    cy.get('[data-test-id=contrast-fg]').clear().type('#777');
    cy.get('[data-test-id=contrast-ratio]').should('contain.text', '4.48');
    cy.get('[data-test-id=contrast-aa-normal]').should('contain.text', 'Fail');
    cy.get('[data-test-id=contrast-aa-large]').should('contain.text', 'Pass');
  });

  it('shows malformed input as an error', () => {
    cy.get('[data-test-id=color-input]').clear().type('garbage');
    cy.get('[data-test-id=color-error]').should('be.visible');
    cy.get('[data-test-id=color-hex]').should('not.exist');
  });
});
