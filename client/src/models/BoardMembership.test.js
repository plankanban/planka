/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import orm from '../orm';

const USER_ID = '1560328737491256322';
const PROJECT_ID = '5';
const BOARD_ID = '20';
const CARD_ID = '30';
const TASK_LIST_ID = '40';
const TASK_ID = '50';

const HEALTHY_MEMBERSHIP_ID = '60';

// A board membership can outlive its board if the deletion did not cascade, so
// `boardMembership.board` resolves to null. Two such rows exist in production today.
const MISSING_BOARD_ID = '1808077422533281675';
const ORPHANED_MEMBERSHIP_ID = '1808077422550058894';

const createSession = () => {
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
    isSubscribed: true,
  });

  session.Card.upsert({
    id: CARD_ID,
    name: 'Card',
    boardId: BOARD_ID,
    isSubscribed: true,
  });

  session.TaskList.upsert({
    id: TASK_LIST_ID,
    name: 'Task list',
    cardId: CARD_ID,
  });

  session.Task.upsert({
    id: TASK_ID,
    name: 'Task',
    taskListId: TASK_LIST_ID,
    assigneeUserId: USER_ID,
  });

  session.Card.withId(CARD_ID).users.add(USER_ID);
  session.Board.withId(BOARD_ID).filterUsers.add(USER_ID);

  session.BoardMembership.upsert({
    id: HEALTHY_MEMBERSHIP_ID,
    boardId: BOARD_ID,
    userId: USER_ID,
  });

  session.BoardMembership.upsert({
    id: ORPHANED_MEMBERSHIP_ID,
    boardId: MISSING_BOARD_ID,
    userId: USER_ID,
  });

  return session;
};

describe('BoardMembership.deleteRelated with an orphaned board membership', () => {
  let session;

  beforeEach(() => {
    session = createSession();
  });

  test('the orphaned board membership really has no board', () => {
    expect(session.Board.withId(MISSING_BOARD_ID)).toBeNull();
    expect(session.BoardMembership.withId(ORPHANED_MEMBERSHIP_ID).board).toBeNull();
  });

  test('deleteRelated is a no-op for the current user when the board is missing', () => {
    session.BoardMembership.withId(ORPHANED_MEMBERSHIP_ID).deleteRelated(true);

    // The surviving board and its card must be left completely untouched.
    expect(session.Board.withId(BOARD_ID).isSubscribed).toBe(true);
    expect(session.Card.withId(CARD_ID).isSubscribed).toBe(true);
  });

  test('deleteRelated is a no-op for another user when the board is missing', () => {
    session.BoardMembership.withId(ORPHANED_MEMBERSHIP_ID).deleteRelated(false);

    expect(session.Board.withId(BOARD_ID).isSubscribed).toBe(true);
    expect(session.Task.withId(TASK_ID).assigneeUserId).toBe(USER_ID);
  });

  test('deleteWithRelated still removes the orphaned membership row', () => {
    session.BoardMembership.withId(ORPHANED_MEMBERSHIP_ID).deleteWithRelated(true);

    expect(session.BoardMembership.withId(ORPHANED_MEMBERSHIP_ID)).toBeNull();
    expect(session.BoardMembership.withId(HEALTHY_MEMBERSHIP_ID)).not.toBeNull();
  });
});

describe('BoardMembership.deleteRelated with a healthy board membership', () => {
  let session;

  beforeEach(() => {
    session = createSession();
  });

  test('the current user is unsubscribed from the board and its cards', () => {
    session.BoardMembership.withId(HEALTHY_MEMBERSHIP_ID).deleteRelated(true);

    expect(session.Board.withId(BOARD_ID).isSubscribed).toBe(false);
    expect(session.Card.withId(CARD_ID).isSubscribed).toBe(false);
  });

  test('the user is detached from cards, tasks and board filters', () => {
    session.BoardMembership.withId(HEALTHY_MEMBERSHIP_ID).deleteRelated(false);

    expect(session.Card.withId(CARD_ID).users.toRefArray()).toEqual([]);
    expect(session.Task.withId(TASK_ID).assigneeUserId).toBeNull();
    expect(session.Board.withId(BOARD_ID).filterUsers.toRefArray()).toEqual([]);
  });
});
