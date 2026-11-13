/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import orm from '../orm';
import { selectMembershipsForCurrentBoard } from './boards';
import { UserRoles } from '../constants/Enums';

const USER_ID = '1560328737491256322';
const PROJECT_ID = '5';
const BOARD_ID = '20';

const HEALTHY_MEMBERSHIP_ID = '30';
const ORPHANED_MEMBERSHIP_ID = '1808077422550058897';

// A board membership can outlive the user it points at, so `boardMembership.user`
// resolves to null. This selector feeds every board route via BoardActions.
const MISSING_USER_ID = '1808077422533281678';

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

  session.BoardMembership.upsert({
    id: HEALTHY_MEMBERSHIP_ID,
    boardId: BOARD_ID,
    userId: USER_ID,
  });

  session.BoardMembership.upsert({
    id: ORPHANED_MEMBERSHIP_ID,
    boardId: BOARD_ID,
    userId: MISSING_USER_ID,
  });

  return {
    orm: session.state,
    router: { location: { pathname: `/boards/${BOARD_ID}` } },
    auth: { userId: USER_ID },
    core: {},
  };
};

describe('selectMembershipsForCurrentBoard with an orphaned membership', () => {
  test('the orphaned membership really has no user', () => {
    const session = orm.session(createState().orm);

    expect(session.User.withId(MISSING_USER_ID)).toBeNull();
    expect(session.BoardMembership.withId(ORPHANED_MEMBERSHIP_ID).user).toBeNull();
  });

  test('the orphan is skipped instead of throwing', () => {
    const memberships = selectMembershipsForCurrentBoard(createState());

    expect(memberships.map(({ id }) => id)).toEqual([HEALTHY_MEMBERSHIP_ID]);
  });

  test('the surviving membership still carries its user', () => {
    const memberships = selectMembershipsForCurrentBoard(createState());

    expect(memberships[0].user.id).toBe(USER_ID);
    expect(memberships[0].isPersisted).toBe(true);
  });
});
