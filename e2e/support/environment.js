// Configuração compartilhada dos testes de interação (Playwright).
//
// Os testes sobem um backend e um frontend próprios, em portas diferentes das
// de desenvolvimento (3000 e 5173), apontando para um banco exclusivo. Assim
// rodar os testes não mexe nos seus dados nem nos servidores que já estão
// abertos.
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendRoot = fileURLToPath(new URL('../..', import.meta.url));

// Pasta do repositório morae-backend. Localmente fica ao lado do pds-morae;
// no CI é clonado dentro dele (veja .github/workflows/e2e.yml).
export const backendDirectory = resolve(
  frontendRoot,
  process.env.BACKEND_DIR ?? '../morae-backend',
);

export const backendPort = Number(process.env.E2E_BACKEND_PORT ?? 3100);
export const frontendPort = Number(process.env.E2E_FRONTEND_PORT ?? 5180);
export const apiUrl = `http://localhost:${backendPort}`;
export const appUrl = `http://localhost:${frontendPort}`;

// Banco recriado do zero a cada execução. O nome precisa terminar em _test.
export const databaseUrl =
  process.env.E2E_DATABASE_URL ??
  'postgresql://morae:morae@localhost:5432/morae_ui_test?schema=public';

export const mailpitUrl = process.env.MAILPIT_URL ?? 'http://localhost:8025';

export function assertTestDatabase(url) {
  const name = new URL(url).pathname.slice(1);
  if (!name.endsWith('_test')) {
    throw new Error(
      `Os testes de interação só rodam em um banco terminado em _test (recebido: "${name}").`,
    );
  }
  return name;
}
