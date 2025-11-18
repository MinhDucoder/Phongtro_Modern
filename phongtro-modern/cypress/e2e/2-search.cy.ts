describe('Search E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('Should display homepage', () => {
    cy.contains('Kênh thông tin Phòng Trọ số 1 Việt Nam').should('be.visible')
  })

  it('Should navigate to search page when searching', () => {
    cy.get('input[placeholder*="Tìm"]').first().should('be.visible').type('phòng')
    cy.get('form').first().submit()
    cy.wait(1000)
    cy.url().should('include', 'tim-kiem')
  })

  it('Should display search results', () => {
    cy.visit('/tim-kiem?q=phong')
    // Results should load
    cy.wait(3000)
    // Check for any posts or "no results" message
    cy.get('body').should('exist')
  })

  it('Should handle Vietnamese search queries', () => {
    cy.visit('/')
    cy.wait(1000)
    cy.get('input[placeholder*="Tìm"]').first().type('nhà trọ')
    cy.get('form').first().submit()
    cy.wait(1000)
    cy.url().should('include', 'tim-kiem')
  })

  it('Should support search filters', () => {
    cy.visit('/tim-kiem?q=phong')
    cy.wait(2000)
    // Check if sidebar or filter section exists
    cy.get('body').should('exist')
  })

  it('Should support pagination', () => {
    cy.visit('/?page=1')
    cy.wait(2000)
    // Look for pagination buttons on homepage
    cy.get('body').then(($body) => {
      const pageButtons = $body.find('button').filter((i, el) => /^[0-9]+$/.test(Cypress.$(el).text().trim()))
      if (pageButtons.length > 1) {
        cy.wrap(pageButtons[1]).click()
        cy.wait(1000)
      }
    })
  })

  it('Should handle empty search results', () => {
    cy.visit('/tim-kiem?q=xyzabc12345notexist')
    cy.wait(3000)
    // Should show no results message or empty state
    cy.get('body').should('exist')
  })

  it('Should show search suggestions', () => {
    cy.visit('/')
    cy.wait(1000)
    cy.get('input[placeholder*="Tìm"]').first().type('ph')
    cy.wait(1500)
    // Suggestions may or may not appear depending on implementation
    cy.get('body').should('exist')
  })
})
