/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import orm from '../orm';
import { selectPath } from './router';
import { ListTypes, UserRoles } from '../constants/Enums';

const USER_ID = '1560328737491256322';
const PROJECT_ID = '5';
const BOARD_ID = '20';
const LIST_ID = '30';

const HEALTHY_CARD_ID = '100';
const ORPHANED_CARD_ID = '1808077422550058896';

// A card carries `boardId` and `listId` as two independent foreign keys. The
// availability guard only walks `card.list.board`, so a card whose own `board`
// hop is broken passes the guard and then throws in the ROOT routing selector.
const MISSING_BOARD_ID = '1808077422533281677';

const createState = () => {
  const session = orm.session(orm.getEmptyState());

  session.User.upsert({
    id: USER_ID,
    email: 'user@example.com',
    name: 'User',
    username: 'user',
    role: UserRoles.ADMIN,
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
  });

  session.List.upsert({
    id: LIST_ID,
    name: 'List',
    type: ListTypes.ACTIVE,
    position: 1,
    boardId: BOARD_ID,
  });

  session.Card.upsert({
    id: HEALTHY_CARD_ID,
    name: 'Healthy card',
    position: 1,
    boardId: BOARD_ID,
    listId: LIST_ID,
  });

  // Reachable through its list, but its own board hop dangles.
  session.Card.upsert({
    id: ORPHANED_CARD_ID,
    name: 'Orphaned card',
    position: 2,
    boardId: MISSING_BOARD_ID,
    listId: LIST_ID,
  });

  return (pathname) => ({
    orm: session.state,
    router: { location: { pathname } },
    auth: { userId: USER_ID },
    core: {},
  });
};

describe('selectPath for a card whose board is missing', () => {
  let buildState;

  beforeEach(() => {
    buildState = createState();
  });

  test('the orphaned card really has no board but passes the availability guard', () => {
    const session = orm.session(buildState('/').orm);
    const cardModel = session.Card.withId(ORPHANED_CARD_ID);

    expect(cardModel.board).toBeNull();
    expect(cardModel.isAvailableForUser(session.User.withId(USER_ID))).toBe(true);
  });

  test('the route resolves to nothing instead of throwing', () => {
    expect(selectPath(buildState(`/cards/${ORPHANED_CARD_ID}`))).toEqual({
      cardId: null,
      boardId: null,
      projectId: null,
    });
  });

  test('a healthy card still resolves to its board and project', () => {
    expect(selectPath(buildState(`/cards/${HEALTHY_CARD_ID}`))).toEqual({
      cardId: HEALTHY_CARD_ID,
      boardId: BOARD_ID,
      projectId: PROJECT_ID,
    });
  });

  test('a board route is unaffected', () => {
    expect(selectPath(buildState(`/boards/${BOARD_ID}`))).toEqual({
      boardId: BOARD_ID,
      projectId: PROJECT_ID,
    });
  });
});
