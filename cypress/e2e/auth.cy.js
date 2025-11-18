/// <reference types="cypress" />

describe('Authentication E2E Tests', () => {
  const testEmail = `cypress-${Date.now()}@example.com`;
  const testPassword = 'CypressTest@123';
  const testName = 'Cypress Test User';
  const testPhone = '0123456789';

  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  describe('User Registration', () => {
    it('Should successfully register new user via UI', () => {
      cy.visit('http://localhost:3000/dang-ky');
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type(testPassword);
      cy.get('input[name="full_name"]').type(testName);
      cy.get('input[name="phone"]').type(testPhone);
      cy.get('button[type="submit"]').click();

      // Verify success notification or redirect
      cy.url().should('include', '/dang-nhap');
    });

    it('Should reject registration with invalid email', () => {
      cy.visit('http://localhost:3000/dang-ky');
      cy.get('input[name="email"]').type('invalid-email');
      cy.get('input[name="password"]').type(testPassword);
      cy.get('input[name="full_name"]').type(testName);
      cy.get('button[type="submit"]').click();

      // Verify error message
      cy.get('.error-message, .alert').should('be.visible');
    });

    it('Should reject registration with short password', () => {
      cy.visit('http://localhost:3000/dang-ky');
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type('short');
      cy.get('input[name="full_name"]').type(testName);
      cy.get('button[type="submit"]').click();

      // Verify error message
      cy.get('.error-message, .alert').should('be.visible');
    });
  });

  describe('User Login', () => {
    it('Should login with valid credentials', () => {
      cy.visit('http://localhost:3000/dang-nhap');
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type(testPassword);
      cy.get('button[type="submit"]').click();

      // Verify successful login - should redirect to dashboard or home
      cy.url().should('not.include', '/dang-nhap');
    });

    it('Should show error with invalid password', () => {
      cy.visit('http://localhost:3000/dang-nhap');
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();

      // Verify error message
      cy.get('.error-message, .alert-danger').should('be.visible');
    });

    it('Should show error with non-existent user', () => {
      cy.visit('http://localhost:3000/dang-nhap');
      cy.get('input[name="email"]').type('nonexistent@example.com');
      cy.get('input[name="password"]').type(testPassword);
      cy.get('button[type="submit"]').click();

      // Verify error message
      cy.get('.error-message, .alert-danger').should('be.visible');
    });
  });

  describe('Password Reset Flow', () => {
    it('Should request password reset', () => {
      cy.visit('http://localhost:3000/quen-mat-khau');
      cy.get('input[name="email"]').type(testEmail);
      cy.get('button[type="submit"]').click();

      // Verify success message
      cy.get('.success-message, .alert-success').should('be.visible');
    });

    it('Should show error for non-existent email', () => {
      cy.visit('http://localhost:3000/quen-mat-khau');
      cy.get('input[name="email"]').type('nonexistent@example.com');
      cy.get('button[type="submit"]').click();

      // Verify error message
      cy.get('.error-message, .alert-danger').should('be.visible');
    });
  });

  describe('User Profile', () => {
    it('Should view user profile after login', () => {
      cy.request('POST', 'http://localhost:5000/api/v1/auth/login', {
        email: testEmail,
        password: testPassword,
      }).then((response) => {
        expect(response.status).to.eq(200);
        const token = response.body.token;
        cy.setCookie('authToken', token);
      });

      cy.visit('http://localhost:3000/profile');
      cy.get('h1, .profile-header').should('be.visible');
    });

    it('Should not allow viewing profile without login', () => {
      cy.visit('http://localhost:3000/profile');

      // Should redirect to login
      cy.url().should('include', '/dang-nhap');
    });
  });

  describe('API-based Authentication', () => {
    it('Should authenticate via API and use token', () => {
      cy.request('POST', 'http://localhost:5000/api/v1/auth/register', {
        email: `api-${Date.now()}@example.com`,
        password: 'ApiTest@123',
        full_name: 'API Test User',
        phone: '0987654321',
      }).then((registerResponse) => {
        expect(registerResponse.status).to.eq(201);

        const apiEmail = registerResponse.body.email;
        cy.request('POST', 'http://localhost:5000/api/v1/auth/login', {
          email: apiEmail,
          password: 'ApiTest@123',
        }).then((loginResponse) => {
          expect(loginResponse.status).to.eq(200);
          expect(loginResponse.body).to.have.property('token');
          expect(loginResponse.body).to.have.property('refreshToken');
        });
      });
    });

    it('Should get user profile with valid token', () => {
      cy.request('POST', 'http://localhost:5000/api/v1/auth/login', {
        email: testEmail,
        password: testPassword,
      }).then((response) => {
        expect(response.status).to.eq(200);
        const token = response.body.token;

        cy.request({
          method: 'GET',
          url: 'http://localhost:5000/api/v1/auth/profile',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).then((profileResponse) => {
          expect(profileResponse.status).to.eq(200);
          expect(profileResponse.body.email).to.eq(testEmail);
        });
      });
    });

    it('Should reject API request without token', () => {
      cy.request({
        method: 'GET',
        url: 'http://localhost:5000/api/v1/auth/profile',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });
  });
});
