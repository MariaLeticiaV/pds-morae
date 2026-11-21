import { expect, test } from '@playwright/test';
import { deleteMessagesTo, waitForLinkIn } from './support/mailpit.js';
import { passwordResetStudent as account } from './support/seed-accounts.js';

test('recupera a senha pelo link enviado por e-mail e entra com a nova', async ({
  page,
}) => {
  const newPassword = 'nova-senha-segura-456';
  await deleteMessagesTo(account.email);

  await page.goto('/login');
  await page.getByRole('link', { name: 'Esqueceu sua senha?' }).click();
  // A URL muda antes da nova página renderizar; espera o formulário certo.
  await expect(
    page.getByRole('heading', { name: 'Recuperar senha' }),
  ).toBeVisible();

  await page.getByLabel('E-mail', { exact: true }).fill(account.email);
  await page.getByRole('button', { name: 'Enviar instruções' }).click();
  await expect(page.getByRole('status')).toContainText(
    'enviaremos um link para redefinir sua senha',
  );

  // O link do e-mail aponta para o frontend de teste (APP_WEB_URL).
  const link = await waitForLinkIn(account.email, '/redefinir-senha');
  await page.goto(link);

  await page.getByLabel('Nova senha', { exact: true }).fill(newPassword);
  await page.getByLabel('Confirmar nova senha').fill(newPassword);
  await page.getByRole('button', { name: 'Alterar senha' }).click();
  await expect(page.getByRole('status')).toHaveText(
    'Senha alterada com sucesso. Você já pode entrar com sua nova senha.',
  );

  await page.getByRole('link', { name: 'Ir para o login' }).click();
  await expect(
    page.getByRole('heading', { name: 'Bem-vindo(a) de volta!' }),
  ).toBeVisible();
  await page.getByLabel('E-mail ou login de administrador').fill(account.email);
  await page.getByLabel('Senha', { exact: true }).fill(account.password);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('E-mail ou senha inválidos.');

  await page.getByLabel('Senha', { exact: true }).fill(newPassword);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL(/\/buscar$/);
});

test('avisa quando a confirmação não bate com a nova senha', async ({ page }) => {
  await page.goto('/redefinir-senha?token=qualquer');

  await page.getByLabel('Nova senha', { exact: true }).fill('nova-senha-segura-456');
  await page.getByLabel('Confirmar nova senha').fill('outra-senha-segura-789');
  await page.getByRole('button', { name: 'Alterar senha' }).click();

  await expect(page.getByRole('alert')).toHaveText(
    'A confirmação da senha não corresponde à nova senha.',
  );
});
