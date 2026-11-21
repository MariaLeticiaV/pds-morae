import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { defineConfig, devices } from '@playwright/test';
import {
  apiUrl,
  appUrl,
  backendDirectory,
  backendPort,
  databaseUrl,
  frontendPort,
} from './e2e/support/environment.js';

const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: './e2e',
  // Todos os testes usam o mesmo banco; em série evitam interferir entre si.
  fullyParallel: false,
  workers: 1,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: appUrl,
    locale: 'pt-BR',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      name: 'backend',
      // Recria o banco antes de subir a API, para começar sempre do seed.
      command: `node e2e/support/prepare-database.mjs && npm --prefix "${backendDirectory}" run start`,
      port: backendPort,
      timeout: 180_000,
      reuseExistingServer: false,
      stdout: 'ignore',
      stderr: 'pipe',
      // Estes valores têm prioridade sobre o .env do backend (o dotenv não
      // sobrescreve variáveis já definidas). Os e-mails vão sempre para o
      // Mailpit, nunca para um SMTP real.
      env: {
        PORT: String(backendPort),
        DATABASE_URL: databaseUrl,
        APP_WEB_URL: appUrl,
        JWT_SECRET:
          process.env.E2E_JWT_SECRET ??
          'segredo-dos-testes-de-interacao-com-32-bytes-ou-mais',
        JWT_EXPIRES_IN_MINUTES: '60',
        UPLOADS_DIR: join(tmpdir(), 'morae-ui-test-uploads'),
        SMTP_HOST: process.env.E2E_SMTP_HOST ?? 'localhost',
        SMTP_PORT: process.env.E2E_SMTP_PORT ?? '1025',
        SMTP_SECURE: 'false',
        SMTP_USER: '',
        SMTP_PASSWORD: '',
        MAIL_FROM: 'Moraê <nao-responda@morae.local>',
        OBSERVE_APP_KEY: '',
        OBSERVE_APP_SECRET: '',
      },
    },
    {
      name: 'frontend',
      // Build de produção em vez do `vite dev`: o servidor de desenvolvimento
      // recarrega a página quando otimiza dependências na primeira execução,
      // o que interrompe os testes. O VITE_API_URL entra no build.
      command: `npm run build && npm run preview -- --port ${frontendPort} --strictPort`,
      url: appUrl,
      timeout: 120_000,
      reuseExistingServer: false,
      stdout: 'ignore',
      env: { VITE_API_URL: apiUrl },
    },
  ],
});
