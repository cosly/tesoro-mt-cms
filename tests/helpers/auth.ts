import type { Page } from '@playwright/test'

/**
 * Helper to login as admin user in Playwright tests
 * Assumes admin user already exists in the database
 */
export async function loginAsAdmin(page: Page) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

  await page.goto('/admin/login')
  await page.fill('input[name="email"]', adminEmail)
  await page.fill('input[name="password"]', adminPassword)
  await page.click('button[type="submit"]')

  // Wait for redirect to admin dashboard
  await page.waitForURL(/\/admin/, { timeout: 10000 })
}

/**
 * Helper to logout from admin panel
 */
export async function logout(page: Page) {
  await page.goto('/admin/logout')
  await page.waitForURL(/\/admin\/login/)
}

/**
 * Helper to create a test user via Payload API
 * Use this in beforeAll/beforeEach for test data setup
 */
export async function createTestUser(email: string, password: string) {
  // This would use Payload's Local API
  // Implementation depends on your test setup
  return {
    email,
    id: 'test-id',
  }
}
