# AGENTS.md - Planka Development Guidelines

This document provides essential information for AI coding agents working on the Planka codebase.

## Project Overview

Planka is an open-source Kanban board application (Trello-like) built with:
- **Client**: React 18 + Redux + Redux-Saga + Vite
- **Server**: Sails.js (Node.js MVC framework) + PostgreSQL
- **Real-time**: Socket.io for live collaboration

## Build/Lint/Test Commands

### Root Level Commands
```bash
npm start              # Start both server and client concurrently
npm run lint           # Run lint on both client and server
npm test               # Run all tests (server + client)

# Client-specific
npm run client:build   # Vite production build
npm run client:lint    # ESLint with Airbnb config + Prettier
npm run client:start   # Vite dev server (port 3000)
npm run client:test    # Jest unit tests

# Server-specific
npm run server:build   # Build server assets
npm run server:lint    # ESLint with Airbnb base + Prettier
npm run server:start   # Sails dev server with nodemon
npm run server:test    # Mocha integration tests

# Database
npm run server:db:migrate   # Run Knex migrations
npm run server:db:seed      # Run seeds
npm run server:db:upgrade   # Full DB setup

# Other
npm run server:console # Interactive Sails console
```

### Running Single Tests

**Client (Jest):**
```bash
cd client && npm test -- --testNamePattern="Test Name"
cd client && npm test -- path/to/test.test.js
```

**Server (Mocha):**
```bash
cd server && npm test -- test/integration/controllers/cards.test.js
cd server && npm test -- --grep "test description"
```

**Acceptance Tests (Cucumber):**
```bash
cd client && npm run test:acceptance -- --tags "@smoke"
cd client && npm run test:acceptance -- features/cards.feature
```

## Code Style Guidelines

### Formatting
- **Line width**: 100 characters
- **Quotes**: Single quotes
- **Trailing commas**: Always
- **ESLint**: Airbnb config with Prettier
- **End of line**: Auto (LF/CRLF handled)

### Client (React/Redux)

**File Structure:**
```
src/
  components/        # React components (.jsx), PascalCase
  entry-actions/     # Action creators (.js), camelCase
  sagas/             # Redux-Saga files (.js), camelCase
  reducers/          # Redux reducers (.js), camelCase
  selectors/         # Reselect selectors (.js), camelCase
  models/            # Redux-ORM models (.js), PascalCase
  api/               # API layer (.js), camelCase
  constants/         # Constants (.js), UPPER_SNAKE_CASE
  hooks/             # Custom hooks (.js), useCamelCase
  utils/             # Utilities (.js), camelCase
```

**Naming:**
- Components: `PascalCase.jsx` (e.g., `CardModal.jsx`)
- Utilities: `camelCase.js` (e.g., `local-id.js`)
- SCSS modules: `Component.module.scss`
- Test files: Co-located or `tests/*.test.js`

**Imports (ES Modules):**
```javascript
// External first
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

// Internal absolute (Vite aliases)
import selectors from '../../../selectors';
import { BoardContext } from '../../../contexts';

// Relative
import ProjectContent from './ProjectContent';
import styles from './Card.module.scss';
```

**React Patterns:**
- Use functional components with hooks
- Use `prop-types` for prop validation
- Use `classnames` for conditional CSS classes
- Use `useCallback` and `useMemo` for performance where needed

**Redux Patterns:**
1. Define action types in `constants/ActionTypes.js`
2. Create entry-actions for action creators
3. Use sagas in `sagas/` for side effects
4. Define models in `models/` for Redux-ORM
5. Create selectors in `selectors/` using reselect

### Server (Sails.js)

**File Structure:**
```
api/
  controllers/       # Controllers by feature, kebab-case folders
    cards/
      create.js
      update.js
  models/            # Models (.js), PascalCase (e.g., Card.js)
  helpers/           # Reusable helpers, kebab-case
  policies/          # Auth middleware (.js), camelCase
  responses/         # Custom responses (.js), camelCase
```

**Naming:**
- Controllers: Folder `kebab-case/`, files `camelCase.js`
- Models: `PascalCase.js` (globals: `Card`, `Board`)
- Helpers: Folder `kebab-case/`, files `camelCase.js`

**Controller Pattern:**
```javascript
module.exports = {
  inputs: {
    name: {
      type: 'string',
      required: true,
    },
  },
  exits: {
    success: {
      responseType: 'ok',
    },
    notFound: {
      responseType: 'notFound',
    },
  },
  async fn(inputs) {
    // Implementation
    return result;
  },
};
```

**Sails Globals:**
- Models: `Card`, `Board`, `Project`, etc. (no imports needed)
- Lodash: `_`
- Sails instance: `sails`

**Imports (CommonJS):**
```javascript
const path = require('path');
const { validate } = require('../../utils/validators');
```

**Error Handling:**
- Use `exits` to define error responses in controllers
- Throw errors to trigger appropriate exit
- Use `sails.log.error()` for server-side logging

## Testing Guidelines

### Client (Jest)
- Tests co-located with source or in `tests/`
- Use `describe/it` pattern
- Mock API calls and Redux store

### Server (Mocha + Chai)
- Integration tests in `test/integration/`
- Utils tests in `test/utils/`
- Use `supertest` for HTTP assertions
- Lifecycle in `test/lifecycle.test.js` handles setup/teardown

### Acceptance (Cucumber + Playwright)
- Features in `tests/acceptance/features/`
- Step definitions in `tests/acceptance/steps/`
- Page objects in `tests/acceptance/pages/`

## Pre-commit Hooks

- Husky runs `lint-staged` on commit
- Client: `eslint --ext js,jsx src`
- Server: `eslint . --max-warnings=0`

## Environment Variables

Server uses `dotenv`. Key variables:
- `DATABASE_URL`: PostgreSQL connection
- `SECRET_KEY`: JWT secret
- `BASE_URL`: Server base URL

## Important Notes

1. **Always run lint after making changes** - The project has strict linting rules
2. **Migrations**: Use Knex for schema changes, never modify DB manually
3. **Real-time**: Socket.io events must be handled in both client sagas and server controllers
4. **Type safety**: No TypeScript; use PropTypes for React components
5. **Build**: Client builds to `dist/`, server builds assets separately
