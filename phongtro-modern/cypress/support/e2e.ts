// Cypress E2E support file

// Ignore errors that are expected
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignore ResizeObserver error (common in Next.js)
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false
  }
  // Allow other errors
  return true
})

// Custom commands
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/dang-nhap')
  cy.get('input[name="email"]').type(email)
  cy.get('input[name="password"]').type(password)
  cy.get('button[type="submit"]').contains('Đăng nhập').click()
  cy.wait(2000)
})

Cypress.Commands.add('logout', () => {
  cy.get('button[aria-label="Menu"]').click({ force: true })
  cy.contains('Đăng xuất').click()
  cy.url().should('include', '/')
})

Cypress.Commands.add('searchPost', (query: string) => {
  cy.get('input[placeholder*="Tìm"]').first().type(query)
  cy.get('form').first().submit()
  cy.wait(1000)
  cy.url().should('include', 'tim-kiem')
})

export {}

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<Element>
      logout(): Chainable<Element>
      searchPost(query: string): Chainable<Element>
    }
  }
}
