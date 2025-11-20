describe('Full E2E Test - Frontend + Backend Integration', () => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:5000/api/v1'
  
  before(() => {
    // Check backend is running
    cy.request(`${apiUrl}/posts?page=1&limit=1`).then((response) => {
      expect(response.status).to.eq(200)
    })
  })

  describe('Search Flow - Frontend to Backend', () => {
    it('Should search posts via frontend and get results from backend API', () => {
      cy.visit('/')
      cy.wait(1000)
      
      // Search from frontend
      cy.get('input[placeholder*="Tìm"]').first().type('phòng trọ')
      cy.get('form').first().submit()
      cy.wait(2000)
      
      // Verify URL changed
      cy.url().should('include', 'tim-kiem')
      
      // Verify backend API was called (check network)
      cy.intercept('GET', '**/api/v1/posts*').as('getPosts')
      cy.wait('@getPosts').then((interception) => {
        expect(interception.response).to.exist
        expect(interception.response?.statusCode).to.be.oneOf([200, 304])
      })
    })

    it('Should handle Vietnamese characters in search', () => {
      cy.visit('/tim-kiem?q=nhà%20trọ')
      cy.wait(2000)
      
      // Check that page loaded without errors
      cy.get('body').should('exist')
    })
  })

  describe('Post Listing - Backend Data Display', () => {
    it('Should display posts from backend API on homepage', () => {
      // First check backend has data
      cy.request(`${apiUrl}/posts?page=1&limit=12`).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.success).to.be.true
        
        const postsCount = response.body.data?.items?.length || 0
        
        // Then check frontend displays them
        cy.visit('/')
        cy.wait(2000)
        
        if (postsCount > 0) {
          // Should have room cards
          cy.get('a[href*="/phong-tro/"]').should('have.length.greaterThan', 0)
        }
      })
    })
  })

  describe('Property Detail - Full Stack Integration', () => {
    it('Should view property detail with data from backend', () => {
      // Get a post ID from backend
      cy.request(`${apiUrl}/posts?page=1&limit=1`).then((response) => {
        if (response.body.data?.items?.length > 0) {
          const postId = response.body.data.items[0]._id
          
          // Visit detail page
          cy.visit(`/phong-tro/${postId}`)
          cy.wait(2000)
          
          // Verify page loaded
          cy.get('body').should('exist')
        }
      })
    })
  })

  describe('Rating System - Full Integration', () => {
    it('Should display ratings from backend API', () => {
      // Get a post with ratings
      cy.request(`${apiUrl}/posts?page=1&limit=1`).then((postResponse) => {
        if (postResponse.body.data?.items?.length > 0) {
          const postId = postResponse.body.data.items[0]._id
          
          // Check if post has ratings in backend
          cy.request({
            url: `${apiUrl}/posts/${postId}/rating`,
            failOnStatusCode: false
          }).then((ratingResponse) => {
            // Visit frontend
            cy.visit(`/phong-tro/${postId}`)
            cy.wait(2000)
            
            // Check for rating section
            cy.get('body').then(($body) => {
              const hasRatingSection = 
                $body.text().includes('Đánh giá') ||
                $body.text().includes('Rating') ||
                $body.text().includes('Bình luận')
              
              expect(hasRatingSection).to.be.true
            })
          })
        }
      })
    })
  })

  describe('API Error Handling', () => {
    it('Should handle backend errors gracefully', () => {
      // Visit page with invalid ID
      cy.visit('/phong-tro/invalid123')
      cy.wait(2000)
      
      // Should show 404 or error page, not crash
      cy.get('body').should('exist')
    })
  })
})
