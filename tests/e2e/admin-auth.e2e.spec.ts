import { test, expect } from '@playwright/test'
import { loginAsAdmin, logout } from '../helpers/auth'

test.describe('Admin Authentication', () => {
  test('admin can login successfully', async ({ page }) => {
    await loginAsAdmin(page)

    // Verify we're on the admin dashboard
    await expect(page).toHaveURL(/\/admin/)

    // Check for admin panel UI elements
    const nav = page.locator('nav')
    await expect(nav).toBeVisible()
  })

  test('admin can logout', async ({ page }) => {
    await loginAsAdmin(page)
    await logout(page)

    // Verify redirect to login page
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/admin/login')
    await page.fill('input[name="email"]', 'wrong@example.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    // Check for error message
    const error = page.locator('text=/invalid|incorrect|wrong/i')
    await expect(error).toBeVisible({ timeout: 5000 })
  })

  test('prevents access to admin without login', async ({ page }) => {
    // Try to access admin directly without logging in
    await page.goto('/admin')

    // Should redirect to login
    await expect(page).toHaveURL(/\/admin\/login/)
  })
})
