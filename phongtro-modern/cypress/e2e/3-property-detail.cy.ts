describe('Property Detail E2E Tests', () => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5000/api/v1'
  let testPostId: string

  before(() => {
    // Get a valid post ID from API
    cy.request({
      method: 'GET',
      url: `${apiUrl}/posts?page=1&limit=1`,
      failOnStatusCode: false
    }).then((response) => {
      if (response.status === 200 && response.body.data?.items?.length > 0) {
        testPostId = response.body.data.items[0]._id
      }
    })
  })

  beforeEach(() => {
    cy.visit('/')
  })

  it('Should navigate to property detail page', () => {
    // TC_PROPERTY_01: Navigate to property detail
    cy.visit('/phong-tro')
    cy.wait(2000)
    
    // Verify property list page loaded
    cy.get('body').should('be.visible')
    
    // Find and click first property
    cy.get('a[href*="/phong-tro/"]').should('have.length.greaterThan', 0)
    cy.get('a[href*="/phong-tro/"]').first().click()
    
    // Should navigate to detail page with valid ID format
    cy.url().should('match', /\/phong-tro\/[a-zA-Z0-9]+/)
    
    // Page should load successfully
    cy.get('body').should('be.visible')
    
    // Should have property content (not 404)
    cy.get('body').then(($body) => {
      const is404 = $body.text().includes('404') || $body.text().includes('không tồn tại')
      expect(is404).to.be.false
    })
  })

  it('Should display property images', () => {
    // TC_PROPERTY_02: Display property images
    cy.visit('/phong-tro')
    cy.wait(2000)
    cy.get('a[href*="/phong-tro/"]').first().click()
    
    // Wait for page to load
    cy.get('body').should('be.visible')
    
    // Check for images
    cy.get('img').should('have.length.greaterThan', 0)
    
    // Verify at least one image is loaded (not broken)
    cy.get('img').first().should('be.visible')
    cy.get('img').first().should('have.attr', 'src').and('not.be.empty')
    
    // Check if image actually loads (not 404)
    cy.get('img').first().should(($img) => {
      // Image should have naturalWidth > 0 if loaded successfully
      expect($img[0].naturalWidth).to.be.greaterThan(0)
    })
  })

  it('Should display property description', () => {
    // TC_PROPERTY_03: Display property description
    cy.visit('/phong-tro')
    cy.wait(2000)
    cy.get('a[href*="/phong-tro/"]').first().click()
    
    // Wait for content
    cy.get('body').should('be.visible')
    
    // Check for description section (multiple possible labels)
    cy.get('body').then(($body) => {
      const bodyText = $body.text()
      const hasDescription = 
        bodyText.includes('Mô tả') ||
        bodyText.includes('Chi tiết') ||
        bodyText.includes('Thông tin')
      
      expect(hasDescription).to.be.true
    })
    
    // Description should have actual content (not just header)
    cy.get('body').invoke('text').should('have.length.greaterThan', 100)
  })

  it('Should display landlord contact info', () => {
    cy.visit('/phong-tro')
    cy.wait(2000)
    cy.get('a[href*="/phong-tro/"]').first().click()
    // Should show landlord info
    cy.get('body').then(($body) => {
      expect(
        $body.text().includes('Liên hệ') ||
          $body.text().includes('Chủ') ||
          $body.text().includes('SĐT')
      ).to.be.true
    })
  })

  it('Should show amenities list', () => {
    cy.visit('/phong-tro')
    cy.wait(2000)
    cy.get('a[href*="/phong-tro/"]').first().click()
    // Check for amenities section
    cy.get('body').then(($body) => {
      expect(
        $body.text().includes('Tiện nghi') ||
          $body.text().includes('amenities') ||
          $body.text().includes('WiFi')
      ).to.be.true
    })
  })

  it('Should allow navigation between properties', () => {
    cy.visit('/phong-tro')
    cy.wait(2000)
    cy.get('a[href*="/phong-tro/"]').first().click()
    cy.url().should('match', /\/phong-tro\/[a-zA-Z0-9]+/)
    // Look for next/previous buttons
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Tiếp theo")').length > 0) {
        cy.get('button:contains("Tiếp theo")').click()
      }
    })
  })
})
