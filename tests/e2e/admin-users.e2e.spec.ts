import { test, expect } from '@playwright/test'
import { loginAsAdmin } from '../helpers/auth'

test.describe('Admin Users Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('can view users collection', async ({ page }) => {
    await page.goto('/admin/collections/users')

    // Check for users list view
    await expect(page.locator('h1, h2').filter({ hasText: /users/i })).toBeVisible()

    // Check for list or table
    const usersList = page.locator('table, [data-testid="users-list"], .list-view')
    await expect(usersList).toBeVisible()
  })

  test('can navigate to create user form', async ({ page }) => {
    await page.goto('/admin/collections/users')

    // Click create new user
    const createButton = page
      .locator('a, button')
      .filter({ hasText: /create/i })
      .first()
    await createButton.click()

    // Verify we're on the create form
    await expect(page).toHaveURL(/\/admin\/collections\/users\/create/)

    // Check for email input (required field)
    const emailInput = page.locator('input[name="email"]')
    await expect(emailInput).toBeVisible()
  })

  test('validates required fields on user creation', async ({ page }) => {
    await page.goto('/admin/collections/users/create')

    // Try to submit without filling required fields
    await page.click('button[type="submit"]')

    // Should show validation errors
    const errorMessage = page.locator('text=/required|field is required|must provide/i')
    await expect(errorMessage).toBeVisible({ timeout: 3000 })
  })

  test('can create a new user with valid data', async ({ page }) => {
    await page.goto('/admin/collections/users/create')

    // Generate unique email
    const timestamp = Date.now()
    const testEmail = `test-user-${timestamp}@example.com`

    // Fill form
    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="password"]', 'SecurePassword123!')

    // Submit
    await page.click('button[type="submit"]')

    // Wait for success or redirect
    await expect(
      page.locator('text=/success|created|saved/i').or(page.locator('[role="alert"]')),
    ).toBeVisible({ timeout: 10000 })

    // Verify redirect to user detail or list
    await expect(page).toHaveURL(/\/admin\/collections\/users/)
  })

  test('prevents duplicate email registration', async ({ page }) => {
    // This test assumes there's already an admin user
    await page.goto('/admin/collections/users/create')

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'

    // Try to create user with existing email
    await page.fill('input[name="email"]', adminEmail)
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Should show error about duplicate email
    const errorMessage = page.locator('text=/already exists|duplicate|already in use/i')
    await expect(errorMessage).toBeVisible({ timeout: 5000 })
  })
})
