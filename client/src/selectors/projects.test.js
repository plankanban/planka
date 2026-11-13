/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import orm from '../orm';
import { selectManagersForCurrentProject } from './projects';
import { UserRoles } from '../constants/Enums';

const USER_ID = '1560328737491256322';
const PROJECT_ID = '5';

const HEALTHY_MANAGER_ID = '30';
const ORPHANED_MANAGER_ID = '1808077422550058899';

// A project manager can outlive the user it points at, so `projectManager.user`
// resolves to null. This is the sibling of the row that white-screened the app.
const MISSING_USER_ID = '1808077422533281681';

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

  session.ProjectManager.upsert({
    id: HEALTHY_MANAGER_ID,
    projectId: PROJECT_ID,
    userId: USER_ID,
  });

  session.ProjectManager.upsert({
    id: ORPHANED_MANAGER_ID,
    projectId: PROJECT_ID,
    userId: MISSING_USER_ID,
  });

  return {
    orm: session.state,
    router: { location: { pathname: `/projects/${PROJECT_ID}` } },
    auth: { userId: USER_ID },
    core: {},
  };
};

describe('selectManagersForCurrentProject with an orphaned manager', () => {
  test('the orphaned manager really has no user', () => {
    const session = orm.session(createState().orm);

    expect(session.User.withId(MISSING_USER_ID)).toBeNull();
    expect(session.ProjectManager.withId(ORPHANED_MANAGER_ID).user).toBeNull();
  });

  test('the orphan is skipped instead of throwing', () => {
    const managers = selectManagersForCurrentProject(createState());

    expect(managers.map(({ id }) => id)).toEqual([HEALTHY_MANAGER_ID]);
  });

  test('the surviving manager still carries its user', () => {
    const managers = selectManagersForCurrentProject(createState());

    expect(managers[0].user.id).toBe(USER_ID);
    expect(managers[0].isPersisted).toBe(true);
  });
});
