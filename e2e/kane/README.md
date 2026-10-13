# End-to-end (e2e) tests for web

Browser end-to-end tests for PLANKA's core board workflow, authored with [KaneCLI](https://www.testmuai.com/kane-cli/) by TestMu AI. Each test is a plain-English `_test.md` file; KaneCLI runs it in a real Chrome browser and records each step so later runs replay without re-authoring.

| Test | What it covers |
|---|---|
| `project_board_test.md` | Logging in, creating a project, and creating a board in it |
| `list_card_test.md` | Adding a list to a board, adding a card to the list, and opening the card details |

They complement the Cucumber acceptance tests in `client/tests/acceptance`, which cover login and IME input.

## Run the tests

The tests expect PLANKA at `http://localhost:3000` with the same demo admin the acceptance tests use (`demo` / `demo`). With the root `docker-compose.yml`, add the admin through a `compose.override.yaml`:

```yaml
services:
  planka:
    environment:
      - DEFAULT_ADMIN_EMAIL=demo@demo.demo
      - DEFAULT_ADMIN_PASSWORD=demo
      - DEFAULT_ADMIN_NAME=Demo Demo
      - DEFAULT_ADMIN_USERNAME=demo
```

```bash
docker compose up -d
```

As in the `Build and Test` workflow, mark the terms as accepted so the first login doesn't stop at the terms screen:

```bash
TERMS_SIGNATURE=$(docker compose exec -T planka sha256sum terms/_template/en-US.md | awk '{print $1}')
docker compose exec -T postgres psql -U postgres -d planka -c "UPDATE user_account SET terms_signature = '$TERMS_SIGNATURE';"
```

### With KaneCLI

```bash
npm install -g @testmuai/kane-cli
kane-cli login
kane-cli testmd run e2e/kane/project_board_test.md --agent
kane-cli testmd run e2e/kane/list_card_test.md --agent
```

### With the exported Playwright code

Each test also has an exported Playwright (JavaScript) version under `output-<test>/playwright-javascript-code/`:

```bash
cd e2e/kane/output-project_board/playwright-javascript-code
npm install
npx playwright install chromium
node test.js
```

Copy `.env.example` to `.env` and fill in your TestMu AI (LambdaTest) credentials first.

## Editing a test

Edit the step text in the `_test.md` file and run it again with `kane-cli testmd run`. Changed steps (and the steps after them) are re-recorded; unchanged steps replay from `output-<test>/`.
