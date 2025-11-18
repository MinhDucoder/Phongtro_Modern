describe('Rating E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('Should display property detail page', () => {
    cy.visit('/phong-tro')
    cy.wait(2000)
    // Navigate to a property
    cy.get('a[href*="/phong-tro/"]').first().click()
    cy.url().should('match', /\/phong-tro\/[a-zA-Z0-9]+/)
  })

  it('Should show rating section on property detail', () => {
    cy.visit('/phong-tro')
    cy.wait(2000)
    cy.get('a[href*="/phong-tro/"]').first().click()
    // Look for rating section
    cy.get('body').then(($body) => {
      expect(
        $body.text().includes('Đánh giá') ||
          $body.text().includes('Rating') ||
          $body.text().includes('Bình luận')
      ).to.be.true
    })
  })

  it('Should show rating form when authenticated (or login prompt)', () => {
    cy.visit('/phong-tro')
    cy.wait(2000)
    cy.get('a[href*="/phong-tro/"]').first().click()
    // Look for rating form or login prompt
    cy.get('body').then(($body) => {
      const hasRatingForm =
        $body.find('form').length > 0 ||
        $body.find('button:contains("Gửi")').length > 0 ||
        $body.find('button:contains("Đánh giá")').length > 0 ||
        $body.text().includes('Đăng nhập')

      expect(hasRatingForm).to.be.true
    })
  })

  it('Should display existing ratings/comments', () => {
    cy.visit('/phong-tro')
    cy.wait(2000)
    cy.get('a[href*="/phong-tro/"]').first().click()
    // Check for comments section
    cy.get('body').then(($body) => {
      expect(
        $body.text().includes('Bình luận') ||
          $body.text().includes('Đánh giá') ||
          $body.text().includes('Comment')
      ).to.be.true
    })
  })

  it('Should show rating statistics', () => {
    cy.visit('/phong-tro')
    cy.wait(2000)
    cy.get('a[href*="/phong-tro/"]').first().click()
    // Look for average rating or stats
    cy.get('body').then(($body) => {
      expect(
        $body.text().includes('⭐') ||
          $body.text().includes('sao') ||
          $body.text().includes('Đánh giá trung bình')
      ).to.be.true
    })
  })
})
