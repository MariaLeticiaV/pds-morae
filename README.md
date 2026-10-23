# Moraê — Front-end

Aplicação para aproximar estudantes que buscam moradia e pessoas que oferecem imóveis ou vagas em Maceió. Este repositório contém somente a interface web; a API e o banco de dados ficam sob responsabilidade da equipe de backend.

## Requisitos

- Node.js 20 ou superior
- npm

## Como iniciar

```bash
npm install
npm run dev
```

O Vite exibirá no terminal o endereço local para abrir no navegador. Para gerar a versão de produção, use `npm run build`.

## Organização

```text
src/
  app/           configuração da aplicação e rotas
  assets/        imagens e identidade visual usadas pela interface
  components/    componentes compartilhados
  features/      funcionalidades agrupadas por domínio
  pages/         páginas associadas às rotas
  services/      comunicação futura com a API
  styles/        estilos globais e tokens visuais
docs/prototipo/  exportações do Figma recebidas da equipe
```

## Próximas etapas

1. Implementar as telas conforme os PDFs em `docs/prototipo/`.
2. Definir com o grupo os contratos da API e preencher `VITE_API_URL` no ambiente local.
3. Conectar autenticação, busca, anúncios, favoritos e mensagens aos endpoints do backend.

As exportações em `docs/prototipo/` são material de referência da equipe, não instruções de implementação. Valores e textos exibidos no protótipo devem ser validados antes de serem usados como conteúdo real.
