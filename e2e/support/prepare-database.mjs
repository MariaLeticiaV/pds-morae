// Recria o banco dos testes de interação, aplica as migrations do backend e
// roda o seed. Executado pelo Playwright antes de subir o backend (veja
// playwright.config.js), para que cada execução comece do mesmo estado.
import { execFileSync } from 'node:child_process';
import pg from 'pg';
import {
  assertTestDatabase,
  backendDirectory,
  databaseUrl,
} from './environment.js';

const database = assertTestDatabase(databaseUrl);

const adminUrl = new URL(databaseUrl);
adminUrl.pathname = '/postgres';
adminUrl.search = '';

const admin = new pg.Client({ connectionString: adminUrl.toString() });
await admin.connect();
try {
  // O nome já foi validado acima; identificadores não aceitam parâmetros.
  await admin.query(`DROP DATABASE IF EXISTS "${database}" WITH (FORCE)`);
  await admin.query(`CREATE DATABASE "${database}"`);
} finally {
  await admin.end();
}

const env = { ...process.env, DATABASE_URL: databaseUrl };
const run = (command, args) =>
  execFileSync(command, args, {
    cwd: backendDirectory,
    env,
    stdio: 'inherit',
  });

run('npx', ['--no-install', 'prisma', 'migrate', 'deploy']);
run('node', ['prisma/seed.mjs']);

console.log(`Banco ${database} pronto para os testes de interação.`);
