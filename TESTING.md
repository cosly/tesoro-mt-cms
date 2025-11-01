# Testing Strategy

This document defines the testing approach for the Tesoro CMS project, focusing on **lightweight but robust tests** with emphasis on critical user flows.

## Test Philosophy

**Pragmatic Testing (60-70% coverage)**

- Focus on critical business logic and user flows
- Avoid testing framework internals or trivial code
- Fast feedback loop is more important than exhaustive coverage
- Test behavior, not implementation details

## Test Types & When to Use Them

### 1. Integration Tests (Vitest)

**Location:** `tests/int/**/*.int.spec.ts`

**Use for:**

- Payload API operations (CRUD)
- Collection hooks and validations
- Access control rules
- Data transformations
- GraphQL queries/mutations

**Example:**

```typescript
describe('Users Collection', () => {
  it('creates user with valid data', async () => {
    const user = await payload.create({
      collection: 'users',
      data: { email: 'test@example.com', password: 'secure123' },
    })
    expect(user.email).toBe('test@example.com')
  })
})
```

**When NOT to use:**

- UI interactions (use Playwright instead)
- Testing Payload core functionality (already tested by Payload)

### 2. End-to-End Tests (Playwright)

**Location:** `tests/e2e/**/*.e2e.spec.ts`

**Use for:**

- Admin panel critical flows (login, CRUD operations, media upload)
- Multi-step user journeys
- Frontend page rendering
- Form submissions and validations

**Example:**

```typescript
test('admin can create new media', async ({ page }) => {
  await loginAsAdmin(page)
  await page.goto('/admin/collections/media')
  await page.click('text=Create New')
  await page.setInputFiles('input[type="file"]', 'test.jpg')
  await page.fill('input[name="alt"]', 'Test image')
  await page.click('button[type="submit"]')
  await expect(page.locator('text=Successfully created')).toBeVisible()
})
```

**When NOT to use:**

- Simple API calls (use integration tests)
- Testing every edge case (keep E2E tests focused on happy paths)

### 3. Unit Tests

**Status:** Not currently used

We avoid traditional unit tests because:

- Most code is Payload configuration (declarative)
- Business logic lives in hooks (tested via integration tests)
- Frontend is minimal (tested via E2E)

Add unit tests only if you write complex utility functions or algorithms.

## Test Execution

### Local Development

```bash
# Run all tests
pnpm test

# Run integration tests only (fast)
pnpm test:int

# Run E2E tests only (slower)
pnpm test:e2e

# Run E2E in headed mode (for debugging)
pnpm exec playwright test --headed

# Run specific test file
pnpm exec vitest tests/int/users.int.spec.ts
pnpm exec playwright test tests/e2e/admin-login.e2e.spec.ts
```

### CI/CD Pipeline

Tests run automatically in 3 scenarios:

1. **Pull Requests** - All tests must pass before merge
2. **Pre-commit** - Fast smoke tests locally before commit
3. **Nightly** - Full test suite including slower scenarios

## Configuration

### Playwright (E2E)

**Browser:** Chromium only (headless by default)

- Fastest Chromium engine
- Covers 90%+ of users
- Add Firefox/Safari only if needed

**Headless Mode:**

- CI: Always headless
- Local: Headless by default, use `--headed` flag to debug

**Workers:**

- CI: Sequential (1 worker) for stability
- Local: Parallel (uses all cores)

**Retries:**

- CI: 2 retries for flaky tests
- Local: 0 retries (fail fast)

### Vitest (Integration)

**Environment:** jsdom

- Simulates browser environment for Payload
- Faster than real browser

**Setup:** Uses `.env` variables for database connection

## Writing Good Tests

### Naming Conventions

**Test Files:**

- Integration: `*.int.spec.ts` (e.g., `users.int.spec.ts`)
- E2E: `*.e2e.spec.ts` (e.g., `admin-login.e2e.spec.ts`)

**Test Descriptions:**
Use clear, behavior-driven descriptions:

```typescript
// Good
test('admin can upload image and set alt text')
test('prevents duplicate email registration')

// Bad
test('test upload')
test('email validation')
```

### Test Structure (AAA Pattern)

```typescript
test('description', async () => {
  // Arrange - Setup test data
  const user = { email: 'test@example.com', password: 'pass123' }

  // Act - Perform action
  const result = await payload.create({ collection: 'users', data: user })

  // Assert - Verify outcome
  expect(result.email).toBe(user.email)
})
```

### Keep Tests Isolated

- Each test should be independent
- Use `beforeEach` for setup, `afterEach` for cleanup
- Don't rely on test execution order

### Use Test Helpers

Create reusable helpers in `tests/helpers/`:

```typescript
// tests/helpers/auth.ts
export async function loginAsAdmin(page: Page) {
  await page.goto('/admin/login')
  await page.fill('input[name="email"]', process.env.ADMIN_EMAIL!)
  await page.fill('input[name="password"]', process.env.ADMIN_PASSWORD!)
  await page.click('button[type="submit"]')
  await page.waitForURL('/admin')
}
```

## Coverage Guidelines

**Target: 60-70% overall**

**Must have tests:**

- Admin authentication flow
- Collection CRUD operations
- Media upload and serving
- Access control rules
- Critical business logic

**Nice to have tests:**

- Edge cases and error handling
- UI variations (mobile/desktop)
- Performance tests

**Skip testing:**

- Payload framework code
- Third-party libraries
- Simple getter/setter functions
- Auto-generated types

## Test Data Management

**Integration Tests:**

- Use a separate test database (`DATABASE_URI_TEST`)
- Seed minimal required data in `beforeAll`
- Clean up in `afterAll`

**E2E Tests:**

- Use fixtures for consistent test data
- Reset database state between test runs if needed
- Store test files in `tests/fixtures/`

## Debugging Failed Tests

### Playwright

```bash
# Run with UI mode
pnpm exec playwright test --ui

# Show browser during test
pnpm exec playwright test --headed

# Debug specific test
pnpm exec playwright test --debug tests/e2e/admin-login.e2e.spec.ts

# View last test report
pnpm exec playwright show-report
```

### Vitest

```bash
# Run in watch mode
pnpm exec vitest --watch

# Run with verbose output
pnpm exec vitest --reporter=verbose

# Run single test with debugging
node --inspect-brk ./node_modules/.bin/vitest run tests/int/users.int.spec.ts
```

## CI/CD Integration

See `.github/workflows/test.yml` for automated test execution.

**PR Requirements:**

- All integration tests pass
- Critical E2E tests pass
- No `test.only` or `test.skip` in committed code

**Pre-commit Hook:**

- Runs fast integration tests (<30s)
- Lints test files
- Prevents commits with test focus

**Nightly Tests:**

- Full E2E suite including slower tests
- Visual regression tests (if configured)
- Performance benchmarks

## Admin Panel Test Checklist

When adding new collections or features, ensure these flows are tested:

- [ ] Admin login/logout
- [ ] List view renders correctly
- [ ] Create new document
- [ ] Edit existing document
- [ ] Delete document
- [ ] Filter and search
- [ ] Media upload (if applicable)
- [ ] Relationships work correctly
- [ ] Validation messages appear
- [ ] Access control enforced

## Performance Targets

**Integration Tests:**

- Full suite: < 30 seconds
- Single test: < 5 seconds

**E2E Tests:**

- Full suite: < 3 minutes
- Single test: < 30 seconds

If tests are slower, consider:

- Reducing test data
- Mocking external services
- Using fixtures instead of setup
- Parallelizing tests

## Maintenance

**Monthly:**

- Review and remove flaky tests
- Update test dependencies
- Check for deprecated Playwright/Vitest features

**Per Feature:**

- Add tests before implementing feature (TDD optional)
- Update existing tests if behavior changes
- Remove tests for deleted features
