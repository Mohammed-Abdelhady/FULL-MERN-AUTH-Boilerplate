import { test, expect } from '@playwright/test';

/**
 * E2E tests for Sidebar Navigation functionality
 * Tests responsive sidebar, collapsible sections, and mobile menu
 */

test.describe('Sidebar Navigation - Desktop', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should display desktop sidebar on large screens', async ({ page }) => {
    // Desktop sidebar should be visible
    const desktopSidebar = page.locator('aside.md\\:block');
    await expect(desktopSidebar).toBeVisible();

    // Mobile hamburger menu should not be visible
    const mobileMenuButton = page.getByTestId('mobile-menu-button');
    await expect(mobileMenuButton).not.toBeVisible();
  });

  test('should display all navigation items in sidebar', async ({ page }) => {
    const nav = page.getByTestId('dashboard-nav');

    // Top-level items
    await expect(nav.getByTestId('nav-link-dashboard')).toBeVisible();
    await expect(nav.getByTestId('nav-link-settings')).toBeVisible();

    // Section headers
    await expect(nav.getByTestId('nav-section-admin')).toBeVisible();
    await expect(nav.getByTestId('nav-section-activity')).toBeVisible();
  });

  test('should highlight active navigation item', async ({ page }) => {
    // Dashboard link should be active
    const dashboardLink = page.getByTestId('nav-link-dashboard');
    await expect(dashboardLink).toHaveClass(/bg-primary/);

    // Navigate to settings
    await page.getByTestId('nav-link-settings').click();
    await page.waitForURL('**/settings');

    // Settings link should now be active
    const settingsLink = page.getByTestId('nav-link-settings');
    await expect(settingsLink).toHaveClass(/bg-primary/);

    // Dashboard link should no longer be active
    await expect(dashboardLink).not.toHaveClass(/bg-primary/);
  });

  test('should collapse and expand Admin section', async ({ page }) => {
    const adminSection = page.getByTestId('nav-section-admin');

    // Admin section should be expanded by default (unless localStorage says otherwise)
    // Items should be visible
    const usersLink = page.getByTestId('nav-link-users');
    const initialVisibility = await usersLink.isVisible();

    // Click to toggle
    await adminSection.click();
    await page.waitForTimeout(300); // Wait for animation

    // Visibility should change
    const newVisibility = await usersLink.isVisible();
    expect(newVisibility).toBe(!initialVisibility);

    // Chevron icon should change
    if (initialVisibility) {
      // Was expanded, now collapsed - should show ChevronRight
      await expect(adminSection.locator('svg').last()).toHaveAttribute('class', /chevron-right/i);
    } else {
      // Was collapsed, now expanded - should show ChevronDown
      await expect(adminSection.locator('svg').last()).toHaveAttribute('class', /chevron-down/i);
    }
  });

  test('should persist collapsed state in localStorage', async ({ page }) => {
    const adminSection = page.getByTestId('nav-section-admin');
    const usersLink = page.getByTestId('nav-link-users');

    // Get initial state
    const initialVisibility = await usersLink.isVisible();

    // Toggle section
    await adminSection.click();
    await page.waitForTimeout(300);

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // State should be persisted
    const newUsersLink = page.getByTestId('nav-link-users');
    const newVisibility = await newUsersLink.isVisible();
    expect(newVisibility).toBe(!initialVisibility);
  });

  test('should collapse and expand Activity section independently', async ({ page }) => {
    const activitySection = page.getByTestId('nav-section-activity');
    const sessionsLink = page.getByTestId('nav-link-sessions');

    // Get initial state
    const initialVisibility = await sessionsLink.isVisible();

    // Toggle Activity section
    await activitySection.click();
    await page.waitForTimeout(300);

    // Sessions link visibility should change
    const newVisibility = await sessionsLink.isVisible();
    expect(newVisibility).toBe(!initialVisibility);
  });

  test('should navigate to correct page when clicking nav items', async ({ page }) => {
    // Click Users link
    await page.getByTestId('nav-link-users').click();
    await expect(page).toHaveURL(/\/admin\/users/);

    // Click Roles link
    await page.getByTestId('nav-link-roles').click();
    await expect(page).toHaveURL(/\/admin\/roles/);

    // Click Sessions link
    await page.getByTestId('nav-link-sessions').click();
    await expect(page).toHaveURL(/\/sessions/);
  });
});

test.describe('Sidebar Navigation - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should hide desktop sidebar on mobile', async ({ page }) => {
    // Desktop sidebar should not be visible
    const desktopSidebar = page.locator('aside.md\\:block').first();
    await expect(desktopSidebar).not.toBeVisible();
  });

  test('should show mobile header with hamburger menu', async ({ page }) => {
    // Mobile header should be visible
    const mobileHeader = page.locator('.md\\:hidden').first();
    await expect(mobileHeader).toBeVisible();

    // Hamburger menu button should be visible
    const menuButton = page.getByTestId('mobile-menu-button');
    await expect(menuButton).toBeVisible();

    // App title should be visible
    await expect(page.getByText('Auth App')).toBeVisible();
  });

  test('should open mobile sidebar when clicking hamburger menu', async ({ page }) => {
    // Mobile sidebar should not be visible initially
    const mobileSidebar = page.getByTestId('mobile-sidebar');
    await expect(mobileSidebar).not.toBeVisible();

    // Click hamburger menu
    await page.getByTestId('mobile-menu-button').click();

    // Mobile sidebar should be visible
    await expect(mobileSidebar).toBeVisible();

    // Backdrop should be visible
    const backdrop = page.getByTestId('mobile-menu-backdrop');
    await expect(backdrop).toBeVisible();
  });

  test('should close mobile sidebar when clicking backdrop', async ({ page }) => {
    // Open sidebar
    await page.getByTestId('mobile-menu-button').click();
    await expect(page.getByTestId('mobile-sidebar')).toBeVisible();

    // Click backdrop
    await page.getByTestId('mobile-menu-backdrop').click();

    // Sidebar should close
    await expect(page.getByTestId('mobile-sidebar')).not.toBeVisible();
  });

  test('should close mobile sidebar when clicking close button', async ({ page }) => {
    // Open sidebar
    await page.getByTestId('mobile-menu-button').click();
    await expect(page.getByTestId('mobile-sidebar')).toBeVisible();

    // Click close button
    await page.getByTestId('mobile-menu-close').click();

    // Sidebar should close
    await expect(page.getByTestId('mobile-sidebar')).not.toBeVisible();
  });

  test('should close mobile sidebar when pressing Escape key', async ({ page }) => {
    // Open sidebar
    await page.getByTestId('mobile-menu-button').click();
    await expect(page.getByTestId('mobile-sidebar')).toBeVisible();

    // Press Escape key
    await page.keyboard.press('Escape');

    // Sidebar should close
    await expect(page.getByTestId('mobile-sidebar')).not.toBeVisible();
  });

  test('should close mobile sidebar when navigating to a page', async ({ page }) => {
    // Open sidebar
    await page.getByTestId('mobile-menu-button').click();
    await expect(page.getByTestId('mobile-sidebar')).toBeVisible();

    // Click a navigation link
    await page.getByTestId('nav-link-settings').click();

    // Sidebar should close automatically
    await expect(page.getByTestId('mobile-sidebar')).not.toBeVisible();

    // URL should change
    await expect(page).toHaveURL(/\/settings/);
  });

  test('should prevent body scroll when mobile sidebar is open', async ({ page }) => {
    // Open sidebar
    await page.getByTestId('mobile-menu-button').click();

    // Body should have overflow hidden
    const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
    expect(bodyOverflow).toBe('hidden');

    // Close sidebar
    await page.getByTestId('mobile-menu-close').click();

    // Body overflow should be restored
    const newBodyOverflow = await page.evaluate(() => document.body.style.overflow);
    expect(newBodyOverflow).toBe('');
  });

  test('should show all navigation items in mobile sidebar', async ({ page }) => {
    // Open sidebar
    await page.getByTestId('mobile-menu-button').click();

    const nav = page.getByTestId('dashboard-nav');

    // All items should be accessible
    await expect(nav.getByTestId('nav-link-dashboard')).toBeVisible();
    await expect(nav.getByTestId('nav-link-settings')).toBeVisible();
    await expect(nav.getByTestId('nav-section-admin')).toBeVisible();
    await expect(nav.getByTestId('nav-section-activity')).toBeVisible();
  });

  test('should support collapsible sections in mobile sidebar', async ({ page }) => {
    // Open sidebar
    await page.getByTestId('mobile-menu-button').click();

    const adminSection = page.getByTestId('nav-section-admin');
    const usersLink = page.getByTestId('nav-link-users');

    // Get initial visibility
    const initialVisibility = await usersLink.isVisible();

    // Toggle section
    await adminSection.click();
    await page.waitForTimeout(300);

    // Visibility should change
    const newVisibility = await usersLink.isVisible();
    expect(newVisibility).toBe(!initialVisibility);
  });
});

test.describe('Sidebar Navigation - Responsive Breakpoints', () => {
  test('should show desktop sidebar at 768px and above', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 720 });
    await page.goto('/dashboard');

    const desktopSidebar = page.locator('aside.md\\:block').first();
    await expect(desktopSidebar).toBeVisible();

    const mobileMenuButton = page.getByTestId('mobile-menu-button');
    await expect(mobileMenuButton).not.toBeVisible();
  });

  test('should show mobile menu at 767px and below', async ({ page }) => {
    await page.setViewportSize({ width: 767, height: 720 });
    await page.goto('/dashboard');

    const desktopSidebar = page.locator('aside.md\\:block').first();
    await expect(desktopSidebar).not.toBeVisible();

    const mobileMenuButton = page.getByTestId('mobile-menu-button');
    await expect(mobileMenuButton).toBeVisible();
  });

  test('should adjust layout when switching between desktop and mobile', async ({ page }) => {
    // Start desktop
    await page.setViewportSize({ width: 1024, height: 720 });
    await page.goto('/dashboard');

    const desktopSidebar = page.locator('aside.md\\:block').first();
    await expect(desktopSidebar).toBeVisible();

    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 });

    // Desktop sidebar should hide
    await expect(desktopSidebar).not.toBeVisible();

    // Mobile menu should appear
    const mobileMenuButton = page.getByTestId('mobile-menu-button');
    await expect(mobileMenuButton).toBeVisible();
  });
});
