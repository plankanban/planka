import assert from 'assert';
import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import Config from '../Config.js';
import CardPage from '../pages/CardPage.js';

const cardPage = new CardPage();

let accessToken;
let cardId;

// ---------- GIVEN ----------

Given('a card with an empty task list exists', async () => {
  const accessTokenResponse = await fetch(`${Config.BASE_URL}/api/access-tokens`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      emailOrUsername: 'demo',
      password: 'demo',
    }),
  });

  ({ item: accessToken } = await accessTokenResponse.json());

  const post = async (path, body) => {
    const response = await fetch(`${Config.BASE_URL}/api${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const { item } = await response.json();
    return item;
  };

  const project = await post('/projects', {
    name: `IME Composition Test ${Date.now()}`,
    type: 'private',
  });

  const board = await post(`/projects/${project.id}/boards`, {
    name: 'Test Board',
    position: 65536,
  });

  const list = await post(`/boards/${board.id}/lists`, {
    name: 'Test List',
    position: 65536,
    type: 'active',
  });

  const card = await post(`/lists/${list.id}/cards`, {
    name: 'Test Card',
    position: 65536,
    type: 'project',
  });

  await post(`/cards/${card.id}/task-lists`, {
    name: 'Test Task List',
    position: 65536,
  });

  cardId = card.id;
});

// ---------- WHEN ----------

When('the user opens the card', async () => {
  await cardPage.navigate(cardId);
});

When('the user opens the add task form', async () => {
  await cardPage.openAddTaskForm();
});

When('the user presses Enter while composing {string} with an IME', async (text) => {
  await cardPage.pressEnterDuringImeComposition(text);
});

// ---------- THEN ----------

Then('the composed text {string} should remain in the task field', async (text) => {
  await expect(page.locator(cardPage.addTaskFieldSelector)).toHaveValue(text);
});

Then('no task named {string} should be added', async (text) => {
  const response = await fetch(`${Config.BASE_URL}/api/cards/${cardId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const { included } = await response.json();
  const taskNames = included.tasks.map(({ name }) => name);

  assert.ok(
    !taskNames.includes(text),
    `Expected no task named "${text}", but found tasks: ${JSON.stringify(taskNames)}`,
  );
});
