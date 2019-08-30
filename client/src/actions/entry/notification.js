import EntryActionTypes from '../../constants/EntryActionTypes';

// eslint-disable-next-line import/prefer-default-export
export const deleteNotification = (id) => ({
  type: EntryActionTypes.NOTIFICATION_DELETE,
  payload: {
    id,
  },
});
