import EntryActionTypes from '../constants/EntryActionTypes';
import ModalTypes from '../constants/ModalTypes';

const openUsersModal = () => ({
  type: EntryActionTypes.MODAL_OPEN,
  payload: {
    type: ModalTypes.USERS,
  },
});

const openUserSettingsModal = () => ({
  type: EntryActionTypes.MODAL_OPEN,
  payload: {
    type: ModalTypes.USER_SETTINGS,
  },
});

const openProjectAddModal = () => ({
  type: EntryActionTypes.MODAL_OPEN,
  payload: {
    type: ModalTypes.PROJECT_ADD,
  },
});

const openProjectSettingsModal = () => ({
  type: EntryActionTypes.MODAL_OPEN,
  payload: {
    type: ModalTypes.PROJECT_SETTINGS,
  },
});

const closeModal = () => ({
  type: EntryActionTypes.MODAL_CLOSE,
  payload: {},
});

export default {
  openUsersModal,
  openUserSettingsModal,
  openProjectAddModal,
  openProjectSettingsModal,
  closeModal,
};
