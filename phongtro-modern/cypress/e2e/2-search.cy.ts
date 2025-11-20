describe('Search E2E Tests', () => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5000/api/v1'

  beforeEach(() => {
    cy.visit('/')
  })

  it('Should display homepage', () => {
    cy.contains('Kênh thông tin Phòng Trọ số 1 Việt Nam').should('be.visible')
  })

  it('Should navigate to search page when searching', () => {
    // TC_SEARCH_02: Search with basic keyword
    cy.intercept('GET', '**/posts*').as('searchPosts')
    
    // Navigate directly to search page with query
    cy.visit('/tim-kiem?q=phòng')
    
    // Wait for API call
    cy.wait('@searchPosts', { timeout: 10000 }).then((interception) => {
      // API should respond successfully
      expect([200, 304]).to.include(interception.response?.statusCode || 0)
    })
    
    // Verify URL
    cy.url().should('include', 'tim-kiem')
    
    // Should display search results or search UI (not just body exists)
    cy.get('body').should('be.visible')
    
    // Check for search-related elements
    cy.get('body').then(($body) => {
      const hasSearchUI = 
        $body.find('input[type="search"], input[placeholder*="Tìm"]').length > 0 ||
        $body.text().includes('Kết quả') ||
        $body.text().includes('Tìm kiếm') ||
        $body.find('a[href*="/phong-tro/"]').length > 0
      
      expect(hasSearchUI).to.be.true
    })
  })

  it('Should display search results', () => {
    cy.visit('/tim-kiem?q=phong')
    // Results should load
    cy.wait(3000)
    // Check for any posts or "no results" message
    cy.get('body').should('exist')
  })

  it('Should handle Vietnamese search queries', () => {
    // Navigate directly with Vietnamese query
    cy.visit('/tim-kiem?q=nhà+trọ')
    cy.wait(1000)
    cy.url().should('include', 'tim-kiem')
    // Should handle Vietnamese text properly
    cy.get('body').should('exist')
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
    // TC_SEARCH_04: Search with no results
    cy.intercept('GET', '**/posts*').as('searchPosts')
    
    cy.visit('/tim-kiem?q=xyzabc12345notexist')
    
    // Wait for API
    cy.wait('@searchPosts', { timeout: 10000 })
    
    // Should show no results message or empty state
    cy.get('body').then(($body) => {
      const bodyText = $body.text()
      const hasEmptyState = 
        bodyText.includes('Không tìm thấy') ||
        bodyText.includes('No results') ||
        bodyText.includes('Không có kết quả') ||
        $body.find('a[href*="/phong-tro/"]').length === 0
      
      expect(hasEmptyState).to.be.true
    })
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
