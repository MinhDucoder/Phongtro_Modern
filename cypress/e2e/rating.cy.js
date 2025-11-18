/// <reference types="cypress" />

describe('Rating API E2E Tests', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'Test@12345';
  let token;
  let postId;
  let landlordToken;
  let landlordEmail = `landlord-${Date.now()}@example.com`;

  before(() => {
    // Register test user
    cy.request('POST', 'http://localhost:5000/api/v1/auth/register', {
      email: testEmail,
      password: testPassword,
      full_name: 'Test User',
      phone: '0123456789',
    }).then((response) => {
      expect(response.status).to.eq(201);
    });

    // Login user
    cy.request('POST', 'http://localhost:5000/api/v1/auth/login', {
      email: testEmail,
      password: testPassword,
    }).then((response) => {
      expect(response.status).to.eq(200);
      token = response.body.token;
    });

    // Register landlord
    cy.request('POST', 'http://localhost:5000/api/v1/auth/register', {
      email: landlordEmail,
      password: testPassword,
      full_name: 'Test Landlord',
      phone: '0987654321',
      role: 'landlord',
    }).then((response) => {
      expect(response.status).to.eq(201);
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

  describe('POST /api/v1/posts/:id/rating', () => {
    it('Should create rating successfully with 5 stars', () => {
      // Assume a post exists (get first active post)
      cy.request('GET', 'http://localhost:5000/api/v1/posts').then(
        (response) => {
          expect(response.status).to.eq(200);
          if (response.body.items.length > 0) {
            postId = response.body.items[0]._id;

            // Rate the post
            cy.request('POST', `http://localhost:5000/api/v1/posts/${postId}/rating`, {
              rating: 5,
              comment: 'Phòng trọ rất đẹp!',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }).then((ratingResponse) => {
              expect(ratingResponse.status).to.eq(201);
              expect(ratingResponse.body.rating).to.eq(5);
              expect(ratingResponse.body.comment).to.eq('Phòng trọ rất đẹp!');
            });
          }
        }
      );
    });

    it('Should reject rating outside 1-5 range', () => {
      cy.request('GET', 'http://localhost:5000/api/v1/posts').then((response) => {
        if (response.body.items.length > 0) {
          const pid = response.body.items[0]._id;

          cy.request({
            method: 'POST',
            url: `http://localhost:5000/api/v1/posts/${pid}/rating`,
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: {
              rating: 6,
              comment: 'Invalid',
            },
            failOnStatusCode: false,
          }).then((ratingResponse) => {
            expect(ratingResponse.status).to.eq(400);
          });
        }
      });
    });

    it('Should update rating if already rated', () => {
      cy.request('GET', 'http://localhost:5000/api/v1/posts').then((response) => {
        if (response.body.items.length > 0) {
          const pid = response.body.items[0]._id;

          // First rating
          cy.request({
            method: 'POST',
            url: `http://localhost:5000/api/v1/posts/${pid}/rating`,
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: {
              rating: 3,
              comment: 'OK',
            },
          }).then((response) => {
            expect(response.status).to.eq(201);
          });

          // Update rating
          cy.request({
            method: 'POST',
            url: `http://localhost:5000/api/v1/posts/${pid}/rating`,
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: {
              rating: 5,
              comment: 'Rất tốt!',
            },
          }).then((response) => {
            expect(response.status).to.eq(201);
            expect(response.body.rating).to.eq(5);
            expect(response.body.comment).to.eq('Rất tốt!');
          });
        }
      });
    });
  });

  describe('GET /api/v1/posts/:id/ratings', () => {
    it('Should list ratings with pagination', () => {
      cy.request('GET', 'http://localhost:5000/api/v1/posts').then((response) => {
        if (response.body.items.length > 0) {
          const pid = response.body.items[0]._id;

          cy.request(
            'GET',
            `http://localhost:5000/api/v1/posts/${pid}/ratings?page=1&limit=10`
          ).then((ratingResponse) => {
            expect(ratingResponse.status).to.eq(200);
            expect(ratingResponse.body).to.have.property('data');
            expect(ratingResponse.body).to.have.property('pagination');
          });
        }
      });
    });

    it('Should filter ratings by star', () => {
      cy.request('GET', 'http://localhost:5000/api/v1/posts').then((response) => {
        if (response.body.items.length > 0) {
          const pid = response.body.items[0]._id;

          cy.request(
            'GET',
            `http://localhost:5000/api/v1/posts/${pid}/ratings?star=5`
          ).then((ratingResponse) => {
            expect(ratingResponse.status).to.eq(200);
            if (ratingResponse.body.data.length > 0) {
              ratingResponse.body.data.forEach((rating) => {
                expect(rating.rating).to.eq(5);
              });
            }
          });
        }
      });
    });
  });

  describe('DELETE /api/v1/posts/:id/rating', () => {
    it('Should delete rating successfully', () => {
      cy.request('GET', 'http://localhost:5000/api/v1/posts').then((response) => {
        if (response.body.items.length > 0) {
          const pid = response.body.items[0]._id;

          // Create rating first
          cy.request({
            method: 'POST',
            url: `http://localhost:5000/api/v1/posts/${pid}/rating`,
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: {
              rating: 4,
              comment: 'Good',
            },
          }).then(() => {
            // Delete rating
            cy.request({
              method: 'DELETE',
              url: `http://localhost:5000/api/v1/posts/${pid}/rating`,
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }).then((deleteResponse) => {
              expect(deleteResponse.status).to.eq(200);
            });
          });
        }
      });
    });
  });
});
