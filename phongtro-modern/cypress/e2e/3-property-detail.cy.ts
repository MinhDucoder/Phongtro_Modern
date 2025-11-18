describe('Property Detail E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('Should navigate to property detail page', () => {
    cy.visit('/phong-tro')
    cy.wait(2000)
    // Click first property
    cy.get('a[href*="/phong-tro/"]').first().click()
    // Should navigate to detail page
    cy.url().should('match', /\/phong-tro\/[a-zA-Z0-9]+/)
  })

  it('Should display property images', () => {
    cy.visit('/phong-tro')
    cy.wait(2000)
    cy.get('a[href*="/phong-tro/"]').first().click()
    // Check for image gallery
    cy.get('img').should('have.length.greaterThan', 0)
  })

  it('Should display property description', () => {
    cy.visit('/phong-tro')
    cy.wait(2000)
    cy.get('a[href*="/phong-tro/"]').first().click()
    // Description should exist
    cy.get('body').should('contain', 'Mô tả')
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
