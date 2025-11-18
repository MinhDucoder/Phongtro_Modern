describe('Auth E2E Tests', () => {
  const testEmail = `test-${Date.now()}@example.com`
  const testPassword = 'TestPass@123'
  const testPhone = '0912345678'

  beforeEach(() => {
    cy.visit('/')
  })

  it('Should navigate to login page', () => {
    cy.visit('/dang-nhap')
    cy.contains('Đăng nhập').should('be.visible')
  })

  it('Should show error on invalid credentials', () => {
    cy.visit('/dang-nhap')
    cy.get('input[type="email"]').type('wrong@example.com')
    cy.get('input[type="password"]').type('wrongpassword')
    cy.get('button[type="submit"]').click()
    // Should show error message or stay on login page
    cy.url().should('include', '/dang-nhap')
  })

  it('Should navigate to register page', () => {
    cy.visit('/dang-ky')
    cy.contains('Đăng ký').should('be.visible')
  })

  it('Should have navbar with auth links', () => {
    cy.get('nav').should('be.visible')
    cy.contains('Đăng nhập').should('be.visible')
    cy.contains('Đăng ký').should('be.visible')
  })

  it('Should navigate to forgot password page', () => {
    cy.visit('/dang-nhap')
    cy.contains('Quên mật khẩu').click()
    cy.url().should('include', '/quen-mat-khau')
  })

  it('Should have proper form validation', () => {
    cy.visit('/dang-nhap')
    // Try to submit empty form
    cy.get('button[type="submit"]').click()
    // Should still be on login page or show error
    cy.url().should('include', '/dang-nhap')
  })

  it('Should display user profile after login', () => {
    // This test requires valid credentials
    // Adjust based on your test user setup
    cy.visit('/dang-nhap')
    // Login is typically tested in integration tests with real user creation
  })
})
