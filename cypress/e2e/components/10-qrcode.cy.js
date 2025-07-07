// Cypress E2E test for QRCodeGenerator.vue
// Covers: input, QR code output, and download button

describe('QR Code Generator Component', () => {
  beforeEach(() => {
    cy.visit('/qrcode');
  });

  it('shows QR code for default value', () => {
    cy.get('[data-test-id=qrcode-input]').should('have.value', 'google.com');
    cy.get('[data-test-id=qrcode-output]').should('be.visible');
  });

  it('updates QR code when input changes', () => {
    cy.get('[data-test-id=qrcode-input]').clear().type('https://example.com', { delay: 0, parseSpecialCharSequences: false });
    cy.get('[data-test-id=qrcode-output]').should('be.visible');
    // The QR code is a canvas, so we just check the output is present
  });

  it('download button is present and clickable', () => {
    cy.get('[data-test-id=download-btn]').should('be.visible').click();
    // Can't easily assert file download in Cypress, but button should be clickable
  });
}); 