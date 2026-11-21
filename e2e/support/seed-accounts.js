// Contas criadas pelo prisma/seed.mjs do morae-backend. Só existem no banco
// de testes, que é recriado a cada execução.
export const SEED_PASSWORD = 'senha-segura-123';

export const student = {
  name: 'Ana Beatriz Lima',
  email: 'ana.lima@example.com',
  password: SEED_PASSWORD,
};

// Usada só no teste de redefinição de senha, que troca a senha dela.
export const passwordResetStudent = {
  name: 'Sofia Carvalho Mendes',
  email: 'sofia.mendes@example.com',
  password: SEED_PASSWORD,
};

export const administrator = { login: 'admin', password: 'Admin@123' };

export const seededUserNames = [
  'Mariana Albuquerque',
  'Ana Beatriz Lima',
  'Lucas Henrique Santos',
  'Sofia Carvalho Mendes',
  'Admin',
];
