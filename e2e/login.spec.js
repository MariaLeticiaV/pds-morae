import { expect, test } from '@playwright/test';
import { student } from './support/seed-accounts.js';

async function fillLogin(page, identifier, password) {
  await page.goto('/login');
  await page.getByLabel('E-mail ou login de administrador').fill(identifier);
  await page.getByLabel('Senha', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
}

test.describe('Login de usuário', () => {
  test('entra com a conta do seed e guarda a sessão devolvida pela API', async ({
    page,
  }) => {
    await fillLogin(page, student.email, student.password);

    await expect(page).toHaveURL(/\/buscar$/);
    const session = await page.evaluate(() =>
      JSON.parse(sessionStorage.getItem('morae-user-session')),
    );
    expect(session).toMatchObject({
      name: student.name,
      email: student.email,
      status: 'ACTIVE',
      tokenType: 'Bearer',
    });
    expect(session.accessToken).toBeTruthy();
  });

  test('mostra o erro da API quando a senha está errada', async ({ page }) => {
    await fillLogin(page, student.email, 'senha-incorreta-123');

    await expect(page.getByRole('alert')).toHaveText('E-mail ou senha inválidos.');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('alterna a visibilidade da senha', async ({ page }) => {
    await page.goto('/login');
    const password = page.getByLabel('Senha', { exact: true });
    await password.fill('qualquer-coisa');

    await expect(password).toHaveAttribute('type', 'password');
    await page.getByRole('button', { name: 'Mostrar senha' }).click();
    await expect(password).toHaveAttribute('type', 'text');
    await page.getByRole('button', { name: 'Ocultar senha' }).click();
    await expect(password).toHaveAttribute('type', 'password');
  });
});
