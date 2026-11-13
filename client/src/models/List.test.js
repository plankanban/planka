/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import orm from '../orm';
import { ListTypes } from '../constants/Enums';

const USER_ID = '1560328737491256322';
const PROJECT_ID = '5';
const BOARD_ID = '20';
const LABEL_ID = '25';

const HEALTHY_LIST_ID = '30';
const ORPHANED_LIST_ID = '1808077422550058895';

// A list can outlive its board if the deletion did not cascade, so `list.board`
// resolves to null. `isAvailableForUser` already guards this exact relation.
const MISSING_BOARD_ID = '1808077422533281676';

const createSession = ({ search } = {}) => {
  const session = orm.session(orm.getEmptyState());

  session.User.upsert({
    id: USER_ID,
    email: 'user@example.com',
    name: 'User',
    username: 'user',
  });

  session.Project.upsert({
    id: PROJECT_ID,
    name: 'Project',
    ownerProjectManagerId: null,
  });

  session.Board.upsert({
    id: BOARD_ID,
    name: 'Board',
    projectId: PROJECT_ID,
    search,
  });

  session.Label.upsert({
    id: LABEL_ID,
    name: 'Label',
    boardId: BOARD_ID,
  });

  session.List.upsert({
    id: HEALTHY_LIST_ID,
    name: 'Healthy list',
    type: ListTypes.ACTIVE,
    position: 1,
    boardId: BOARD_ID,
  });

  session.List.upsert({
    id: ORPHANED_LIST_ID,
    name: 'Orphaned list',
    type: ListTypes.ACTIVE,
    position: 1,
    boardId: MISSING_BOARD_ID,
  });

  session.Card.upsert({
    id: '100',
    name: 'Alpha',
    position: 1,
    boardId: BOARD_ID,
    listId: HEALTHY_LIST_ID,
  });

  session.Card.upsert({
    id: '200',
    name: 'Beta',
    position: 2,
    boardId: BOARD_ID,
    listId: HEALTHY_LIST_ID,
  });

  // The orphaned list keeps its cards; only the board hop is broken.
  session.Card.upsert({
    id: '300',
    name: 'Alpha',
    position: 1,
    boardId: MISSING_BOARD_ID,
    listId: ORPHANED_LIST_ID,
  });

  session.Card.upsert({
    id: '400',
    name: 'Beta',
    position: 2,
    boardId: MISSING_BOARD_ID,
    listId: ORPHANED_LIST_ID,
  });

  return session;
};

const idsOf = (cardModels) => cardModels.map((cardModel) => cardModel.id);

describe('List.getFilteredCardsModelArray with an orphaned list', () => {
  test('the orphaned list really has no board', () => {
    const session = createSession();

    expect(session.Board.withId(MISSING_BOARD_ID)).toBeNull();
    expect(session.List.withId(ORPHANED_LIST_ID).board).toBeNull();
  });

  test('every card is returned unfiltered when the board is missing', () => {
    const session = createSession();

    expect(idsOf(session.List.withId(ORPHANED_LIST_ID).getFilteredCardsModelArray())).toEqual([
      '300',
      '400',
    ]);
  });

  test('a board-level search cannot leak into a list whose board is missing', () => {
    const session = createSession({ search: 'alpha' });

    expect(idsOf(session.List.withId(ORPHANED_LIST_ID).getFilteredCardsModelArray())).toEqual([
      '300',
      '400',
    ]);
  });

  test('an empty orphaned list still returns no cards', () => {
    const session = createSession();
    session.Card.withId('300').delete();
    session.Card.withId('400').delete();

    expect(session.List.withId(ORPHANED_LIST_ID).getFilteredCardsModelArray()).toEqual([]);
  });

  test('isAvailableForUser stays false for the orphaned list', () => {
    const session = createSession();

    expect(
      session.List.withId(ORPHANED_LIST_ID).isAvailableForUser(session.User.withId(USER_ID)),
    ).toBe(false);
  });
});

describe('List.getFilteredCardsModelArray with a healthy list', () => {
  test('all cards are returned without a search', () => {
    const session = createSession();

    expect(idsOf(session.List.withId(HEALTHY_LIST_ID).getFilteredCardsModelArray())).toEqual([
      '100',
      '200',
    ]);
  });

  test('a plain board search still filters', () => {
    const session = createSession({ search: 'alpha' });

    expect(idsOf(session.List.withId(HEALTHY_LIST_ID).getFilteredCardsModelArray())).toEqual([
      '100',
    ]);
  });

  test('a regex board search still filters', () => {
    const session = createSession({ search: '/^bet' });

    expect(idsOf(session.List.withId(HEALTHY_LIST_ID).getFilteredCardsModelArray())).toEqual([
      '200',
    ]);
  });

  test('a board user filter still filters', () => {
    const session = createSession();
    session.Board.withId(BOARD_ID).filterUsers.add(USER_ID);
    session.Card.withId('200').users.add(USER_ID);

    expect(idsOf(session.List.withId(HEALTHY_LIST_ID).getFilteredCardsModelArray())).toEqual([
      '200',
    ]);
  });

  test('a board label filter still filters', () => {
    const session = createSession();
    session.Board.withId(BOARD_ID).filterLabels.add(LABEL_ID);
    session.Card.withId('100').labels.add(LABEL_ID);

    expect(idsOf(session.List.withId(HEALTHY_LIST_ID).getFilteredCardsModelArray())).toEqual([
      '100',
    ]);
  });
});
