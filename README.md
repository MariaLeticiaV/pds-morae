# 🏡 Moraê — Moradia Universitária

**Encontre seu espaço. Conecte-se com pessoas. Sinta-se em casa.**

## 📌 Sobre o projeto

O **Moraê** é uma plataforma voltada à moradia universitária, desenvolvida para facilitar a busca por acomodação e aproximar estudantes que compartilham interesses e estilos de vida semelhantes. Mudar de cidade para estudar traz diversos desafios, e encontrar um lugar adequado para morar é um deles. Além de questões como localização e preço, dividir uma moradia envolve compatibilidade de hábitos, preferências e rotina. Pensando nisso, o Moraê busca tornar esse processo mais simples, oferecendo uma experiência que considera tanto as necessidades de moradia quanto a convivência entre estudantes.

## 🎯 Objetivos

- Facilitar a busca por moradias adequadas às necessidades dos universitários.
- Tornar a experiência de encontrar um lugar para morar mais prática e intuitiva.
- Incentivar uma convivência mais harmoniosa por meio da compatibilidade de perfis.

## ✨ Funcionalidades

- **Busca por moradia:** facilitar a descoberta de opções de acomodação para estudantes.
- **Perfis de usuários:** reunir informações relevantes para conhecer melhor os possíveis colegas de moradia.
- **Compatibilidade entre estudantes:** permitir a consulta de compatibilidade entre perfis por meio de uma interface dedicada.
- **Experiência intuitiva:** organizar as informações de maneira clara, facilitando a navegação pela plataforma.

## 🖥️ Interface e experiência do usuário

O Moraê prioriza uma interface organizada, acessível e intuitiva, buscando reduzir a complexidade da procura por moradia universitária. A proposta é apresentar as informações essenciais de forma clara, evitando o excesso de elementos na tela e permitindo que o usuário consulte detalhes adicionais quando necessário.

## 🛠️ Tecnologias utilizadas

- **Frontend:** React 19, JavaScript (JSX), React Router 7 e Vite 6
- **Backend:** mantido em um repositório separado.

## 🚀 Como executar o projeto

### Pré-requisitos

- Node.js 20 ou superior
- npm, instalado junto com o Node.js
- Git, para clonar o repositório

### Instalação

1. Clone o repositório:

   ```bash
   git clone <URL_DO_REPOSITORIO>
   ```

2. Acesse a pasta do projeto:

   ```bash
   cd morae
   ```

3. Instale as dependências:

   ```bash
   npm install
   ```

  4. Inicie o servidor de desenvolvimento:
  
 ```bash
   npm run dev
   ```


## 🧪 Testes de interação

Os testes em `e2e/` usam o [Playwright](https://playwright.dev) e rodam contra o backend real. Eles sobem uma API e um frontend próprios (portas 3100 e 5180), com o banco `morae_ui_test` recriado a partir do seed a cada execução. Seus dados e servidores de desenvolvimento não são afetados.

Pré-requisitos: o repositório `morae-backend` ao lado deste (ou o caminho em `BACKEND_DIR`), com `npm install` feito, e o Postgres e o Mailpit dele rodando (`npm run db:up` no backend).

```bash
npx playwright install chromium   # só na primeira vez
npm run test:e2e                  # roda todos os testes
npm run test:e2e:ui               # modo interativo, para depurar
```

No GitHub, o workflow `.github/workflows/e2e.yml` roda os mesmos testes a cada push na `main` e em cada pull request.
