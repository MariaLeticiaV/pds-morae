import { expect, test } from '@playwright/test';
import { administrator, seededUserNames } from './support/seed-accounts.js';

test.describe('Painel administrativo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page
      .getByLabel('E-mail ou login de administrador')
      .fill(administrator.login);
    await page.getByLabel('Senha', { exact: true }).fill(administrator.password);
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    await expect(page).toHaveURL(/\/admin$/);
  });

  test('lista os usuários vindos do banco e filtra pela busca', async ({
    page,
  }) => {
    await page
      .getByRole('navigation', { name: 'Administração' })
      .getByRole('link', { name: 'Usuários' })
      .click();

    await expect(
      page.getByRole('heading', { level: 1, name: 'Usuários e vínculos' }),
    ).toBeVisible();
    const rows = page.locator('table tbody tr');
    await expect(rows).toHaveCount(seededUserNames.length);
    for (const name of seededUserNames) {
      await expect(rows.filter({ hasText: name })).toHaveCount(1);
    }

    await page.getByPlaceholder('Buscar por nome ou e-mail').fill('Lucas');
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText('Lucas Henrique Santos');
  });

  test('sai do painel e volta para o login', async ({ page }) => {
    await page.getByRole('button', { name: 'Sair' }).click();

    await expect(page).toHaveURL(/\/login$/);
    await page.goto('/admin');
    await expect(page).not.toHaveURL(/\/admin$/);
  });
});
