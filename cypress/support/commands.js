// cypress/support/commands.js

// Login command
Cypress.Commands.add('login', (email, password) => {
  cy.visit('http://localhost:3000/dang-nhap');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('not.include', '/dang-nhap');
});

// API Login command
Cypress.Commands.add('apiLogin', (email, password) => {
  cy.request('POST', 'http://localhost:5000/api/v1/auth/login', {
    email,
    password,
  }).then((response) => {
    expect(response.status).to.eq(200);
    localStorage.setItem('token', response.body.token);
    localStorage.setItem('refreshToken', response.body.refreshToken);
  });
});

// Search posts command
Cypress.Commands.add('searchPosts', (keyword) => {
  cy.visit('http://localhost:3000/phong-tro');
  cy.get('input[placeholder*="Tìm kiếm"]').type(keyword);
  cy.get('button:contains("Tìm")').click();
  cy.get('[data-testid="post-list"]').should('be.visible');
});

// Create post command (API)
Cypress.Commands.add('createPost', (token, postData) => {
  cy.request({
    method: 'POST',
    url: 'http://localhost:5000/api/v1/posts',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: postData,
  }).then((response) => {
    expect(response.status).to.eq(201);
    return response.body;
  });
});

// Rate post command (API)
Cypress.Commands.add('ratePost', (token, postId, rating, comment) => {
  cy.request({
    method: 'POST',
    url: `http://localhost:5000/api/v1/posts/${postId}/rating`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: {
      rating,
      comment,
    },
  }).then((response) => {
    expect(response.status).to.eq(201);
    return response.body;
  });
});

// Get post ratings command (API)
Cypress.Commands.add('getPostRatings', (postId) => {
  cy.request('GET', `http://localhost:5000/api/v1/posts/${postId}/ratings`).then(
    (response) => {
      expect(response.status).to.eq(200);
      return response.body;
    }
  );
});

export {};
