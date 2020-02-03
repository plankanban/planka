import EntryActionTypes from '../../constants/EntryActionTypes';

export const createMembershipInCurrentProject = data => ({
  type: EntryActionTypes.MEMBERSHIP_IN_CURRENT_PROJECT_CREATE,
  payload: {
    data,
  },
});

export const deleteProjectMembership = id => ({
  type: EntryActionTypes.PROJECT_MEMBERSHIP_DELETE,
  payload: {
    id,
  },
});
