/// <reference types="cypress" />

describe('Search and Post E2E Tests', () => {
  let userToken;
  let landlordToken;
  let postId;
  const userEmail = `search-user-${Date.now()}@example.com`;
  const landlordEmail = `search-landlord-${Date.now()}@example.com`;
  const testPassword = 'SearchTest@123';

  before(() => {
    // Register regular user
    cy.request('POST', 'http://localhost:5000/api/v1/auth/register', {
      email: userEmail,
      password: testPassword,
      full_name: 'Search Test User',
      phone: '0123456789',
    }).then((response) => {
      expect(response.status).to.eq(201);
    });

    // Register landlord
    cy.request('POST', 'http://localhost:5000/api/v1/auth/register', {
      email: landlordEmail,
      password: testPassword,
      full_name: 'Search Test Landlord',
      phone: '0987654321',
      role: 'landlord',
    }).then((response) => {
      expect(response.status).to.eq(201);
    });

    // Login user
    cy.request('POST', 'http://localhost:5000/api/v1/auth/login', {
      email: userEmail,
      password: testPassword,
    }).then((response) => {
      expect(response.status).to.eq(200);
      userToken = response.body.token;
    });

    // Login landlord
    cy.request('POST', 'http://localhost:5000/api/v1/auth/login', {
      email: landlordEmail,
      password: testPassword,
    }).then((response) => {
      expect(response.status).to.eq(200);
      landlordToken = response.body.token;
    });
  });

  describe('Search Posts', () => {
    it('Should search posts by keyword', () => {
      cy.visit('http://localhost:3000/phong-tro');
      cy.get('input[placeholder*="Tìm"]').type('nhà trọ gần đây');
      cy.get('button[type="submit"]').click();

      // Verify search results appear
      cy.get('.post-item, .search-results').should('be.visible');
    });

    it('Should search posts with Vietnamese characters', () => {
      cy.request('GET', 'http://localhost:5000/api/v1/posts?q=nhà trọ').then(
        (response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('items');
        }
      );
    });

    it('Should search with URL-encoded Vietnamese', () => {
      cy.request('GET', 'http://localhost:5000/api/v1/posts?q=nh%C3%A0%20tr%E1%BB%8D')
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('items');
        });
    });

    it('Should handle empty search gracefully', () => {
      cy.visit('http://localhost:3000/phong-tro');
      cy.get('button[type="submit"]').click();

      // Should show all posts or empty message
      cy.get('.post-item, .empty-message').should('exist');
    });

    it('Should filter posts by property type', () => {
      cy.request('GET', 'http://localhost:5000/api/v1/posts?propertyType=phong_tro')
        .then((response) => {
          expect(response.status).to.eq(200);
          if (response.body.items.length > 0) {
            response.body.items.forEach((post) => {
              expect(post.propertyType).to.eq('phong_tro');
            });
          }
        });
    });

    it('Should filter posts by province/city', () => {
      cy.request('GET', 'http://localhost:5000/api/v1/posts?province=TPHCM')
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('items');
        });
    });
  });

  describe('Post Pagination', () => {
    it('Should load first page of posts', () => {
      cy.request('GET', 'http://localhost:5000/api/v1/posts?page=1&limit=12')
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.items).to.have.length.lessThan(13);
          expect(response.body.currentPage).to.eq(1);
        });
    });

    it('Should navigate to specific page', () => {
      cy.request('GET', 'http://localhost:5000/api/v1/posts?page=2&limit=12')
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.currentPage).to.eq(2);
        });
    });

    it('Should honor limit parameter', () => {
      cy.request('GET', 'http://localhost:5000/api/v1/posts?limit=5')
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.items.length).to.be.lessThan(6);
        });
    });
  });

  describe('Post Sorting', () => {
    it('Should sort posts by newest first', () => {
      cy.request('GET', 'http://localhost:5000/api/v1/posts?sort=newest')
        .then((response) => {
          expect(response.status).to.eq(200);
          if (response.body.items.length > 1) {
            const first = new Date(response.body.items[0].createdAt);
            const second = new Date(response.body.items[1].createdAt);
            expect(first.getTime()).to.be.greaterThanOrEqual(second.getTime());
          }
        });
    });

    it('Should sort posts by price low to high', () => {
      cy.request('GET', 'http://localhost:5000/api/v1/posts?sort=priceAsc')
        .then((response) => {
          expect(response.status).to.eq(200);
          if (response.body.items.length > 1) {
            expect(response.body.items[0].price).to.be.lessThanOrEqual(
              response.body.items[1].price
            );
          }
        });
    });
  });

  describe('Post Details', () => {
    it('Should display post details', () => {
      cy.request('GET', 'http://localhost:5000/api/v1/posts?limit=1')
        .then((response) => {
          if (response.body.items.length > 0) {
            postId = response.body.items[0]._id;
            cy.request('GET', `http://localhost:5000/api/v1/posts/${postId}`)
              .then((detailResponse) => {
                expect(detailResponse.status).to.eq(200);
                expect(detailResponse.body._id).to.eq(postId);
                expect(detailResponse.body).to.have.property('title');
                expect(detailResponse.body).to.have.property('price');
              });
          }
        });
    });

    it('Should populate user information in post details', () => {
      cy.request('GET', 'http://localhost:5000/api/v1/posts?limit=1')
        .then((response) => {
          if (response.body.items.length > 0) {
            const pid = response.body.items[0]._id;
            cy.request('GET', `http://localhost:5000/api/v1/posts/${pid}`)
              .then((detailResponse) => {
                expect(detailResponse.status).to.eq(200);
                expect(detailResponse.body.user).to.have.property('email');
              });
          }
        });
    });
  });

  describe('Latest Posts Suggestions', () => {
    it('Should get 6 latest posts', () => {
      cy.request('GET', 'http://localhost:5000/api/v1/posts/suggestions/latest')
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('items');
          expect(response.body.items.length).to.be.lessThanOrEqual(6);
        });
    });
  });

  describe('Post UI Navigation', () => {
    it('Should navigate to search page from home', () => {
      cy.visit('http://localhost:3000');
      cy.get('a[href="/phong-tro"], button:contains("Tìm phòng")').first().click();
      cy.url().should('include', '/phong-tro');
    });

    it('Should display post list on search page', () => {
      cy.visit('http://localhost:3000/phong-tro');
      cy.get('.post-item, [data-testid="post-item"]', { timeout: 5000 }).should('exist');
    });

    it('Should click on post to view details', () => {
      cy.visit('http://localhost:3000/phong-tro');
      cy.get('.post-item, [data-testid="post-item"]').first().click();
      cy.url().should('include', '/phong-tro/');
      cy.get('.post-detail, [data-testid="post-detail"]', { timeout: 5000 }).should('be.visible');
    });
  });

  describe('Search Error Handling', () => {
    it('Should handle invalid page number', () => {
      cy.request({
        method: 'GET',
        url: 'http://localhost:5000/api/v1/posts?page=99999',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404]);
      });
    });

    it('Should handle special characters in search', () => {
      cy.request('GET', 'http://localhost:5000/api/v1/posts?q=!@#$%')
        .then((response) => {
          expect(response.status).to.eq(200);
          // Should return empty results, not 400
        });
    });

    it('Should handle missing post ID', () => {
      cy.request({
        method: 'GET',
        url: 'http://localhost:5000/api/v1/posts/invalid-id',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });
  });
});
