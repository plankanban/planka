import EntryActionTypes from '../../constants/EntryActionTypes';
import ModalTypes from '../../constants/ModalTypes';

export const openUsersModal = () => ({
  type: EntryActionTypes.MODAL_OPEN,
  payload: {
    type: ModalTypes.USERS,
  },
});

export const openAddProjectModal = () => ({
  type: EntryActionTypes.MODAL_OPEN,
  payload: {
    type: ModalTypes.ADD_PROJECT,
  },
});

export const closeModal = () => ({
  type: EntryActionTypes.MODAL_CLOSE,
  payload: {},
});
