const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4173',
    supportFile: false,
    specPattern: 'cypress/e2e/**/*.cy.{js,ts}',
    experimentalRunAllSpecs: true,
  },
});

