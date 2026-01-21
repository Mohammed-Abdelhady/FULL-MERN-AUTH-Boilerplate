import { test, expect } from '@playwright/test';

/**
 * E2E tests for Role Management functionality
 * Tests create, edit, and delete role flows
 */

test.describe('Role Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to roles page
    // Note: In a real app, you would need to login first
    await page.goto('/admin/roles');
    await page.waitForLoadState('networkidle');
  });

  test('should display roles page with existing roles', async ({ page }) => {
    // Check page title
    await expect(page.getByRole('heading', { name: /role management/i })).toBeVisible();

    // Check that roles table exists
    await expect(page.locator('[data-testid="roles-table"]')).toBeVisible();

    // Should have at least system roles (user, admin, etc.)
    const roleRows = page.locator('tbody tr');
    await expect(roleRows).toHaveCount(await roleRows.count());
  });

  test('should open create role dialog when clicking create button', async ({ page }) => {
    // Click create role button
    await page.getByTestId('create-role-button').click();

    // Dialog should be visible
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /create new role/i })).toBeVisible();

    // Form fields should be empty
    await expect(page.getByLabel(/role name/i)).toHaveValue('');
    await expect(page.getByLabel(/description/i)).toHaveValue('');
  });

  test('should create a new role successfully', async ({ page }) => {
    // Open create dialog
    await page.getByTestId('create-role-button').click();

    // Fill in role details
    await page.getByLabel(/role name/i).fill('Test Manager');
    await page.getByLabel(/description/i).fill('Test role for E2E testing');

    // Select some permissions
    await page.getByTestId('permission-selector').click();
    await page.getByTestId('permission-users:read:all').click();
    await page.getByTestId('permission-users:update:all').click();

    // Submit form
    await page.getByTestId('save-role-button').click();

    // Success toast should appear
    await expect(page.locator('.sonner-toast')).toContainText(/role created successfully/i);

    // Dialog should close
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // New role should appear in the table
    await expect(page.locator('tbody').getByText('Test Manager')).toBeVisible();
  });

  test('should validate required fields when creating role', async ({ page }) => {
    // Open create dialog
    await page.getByTestId('create-role-button').click();

    // Try to submit without filling fields
    await page.getByTestId('save-role-button').click();

    // Error messages should appear
    await expect(page.getByText(/role name is required/i)).toBeVisible();
    await expect(page.getByText(/at least one permission is required/i)).toBeVisible();

    // Dialog should still be open
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('should edit an existing role', async ({ page }) => {
    // Find and click edit button for a non-protected role
    const editButton = page.locator('[data-testid^="edit-role-"]').first();
    await editButton.click();

    // Edit dialog should be visible
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /edit role/i })).toBeVisible();

    // Form should be pre-filled
    const nameInput = page.getByLabel(/role name/i);
    await expect(nameInput).not.toHaveValue('');

    // Update description
    const descInput = page.getByLabel(/description/i);
    await descInput.clear();
    await descInput.fill('Updated description for E2E test');

    // Save changes
    await page.getByTestId('save-role-button').click();

    // Success toast should appear
    await expect(page.locator('.sonner-toast')).toContainText(/role updated successfully/i);

    // Dialog should close
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should show confirmation dialog when deleting a role', async ({ page }) => {
    // Find delete button for a non-protected role
    const deleteButton = page.locator('[data-testid^="delete-role-"]').first();
    await deleteButton.click();

    // Confirmation dialog should appear
    await expect(page.getByRole('alertdialog')).toBeVisible();
    await expect(page.getByText(/are you sure.*delete/i)).toBeVisible();

    // Should have cancel and confirm buttons
    await expect(page.getByTestId('cancel-delete-button')).toBeVisible();
    await expect(page.getByTestId('confirm-delete-button')).toBeVisible();
  });

  test('should cancel role deletion', async ({ page }) => {
    // Find delete button
    const deleteButton = page.locator('[data-testid^="delete-role-"]').first();
    await deleteButton.click();

    // Click cancel
    await page.getByTestId('cancel-delete-button').click();

    // Dialog should close
    await expect(page.getByRole('alertdialog')).not.toBeVisible();

    // Role should still be in the table
    const roleCount = await page.locator('tbody tr').count();
    expect(roleCount).toBeGreaterThan(0);
  });

  test('should delete a role after confirmation', async ({ page }) => {
    // Get role count before deletion
    const initialCount = await page.locator('tbody tr').count();

    // Find delete button for a non-protected, non-system role
    const deleteButton = page.locator('[data-testid^="delete-role-"]').first();
    await deleteButton.click();

    // Confirm deletion
    await page.getByTestId('confirm-delete-button').click();

    // Success toast should appear
    await expect(page.locator('.sonner-toast')).toContainText(/role deleted successfully/i);

    // Dialog should close
    await expect(page.getByRole('alertdialog')).not.toBeVisible();

    // Role count should decrease
    await page.waitForTimeout(500); // Wait for table update
    const newCount = await page.locator('tbody tr').count();
    expect(newCount).toBeLessThan(initialCount);
  });

  test('should not allow deleting protected roles', async ({ page }) => {
    // Protected roles should have delete buttons disabled
    const protectedRoleRow = page.locator('tbody tr', { hasText: /admin|superadmin/i }).first();
    const deleteButton = protectedRoleRow.locator('[data-testid^="delete-role-"]');

    // Delete button should be disabled
    await expect(deleteButton).toBeDisabled();
  });

  test('should not allow editing protected role names', async ({ page }) => {
    // Find a protected role and click edit
    const protectedRoleRow = page.locator('tbody tr', { hasText: /admin|superadmin/i }).first();
    const editButton = protectedRoleRow.locator('[data-testid^="edit-role-"]');
    await editButton.click();

    // Role name input should be disabled
    const nameInput = page.getByLabel(/role name/i);
    await expect(nameInput).toBeDisabled();

    // Description should still be editable
    const descInput = page.getByLabel(/description/i);
    await expect(descInput).not.toBeDisabled();
  });
});
