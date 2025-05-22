/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';
import ModalTypes from '../constants/ModalTypes';

const openAdministrationModal = () => ({
  type: EntryActionTypes.MODAL_OPEN,
  payload: {
    type: ModalTypes.ADMINISTRATION,
  },
});

const openUserSettingsModal = () => ({
  type: EntryActionTypes.MODAL_OPEN,
  payload: {
    type: ModalTypes.USER_SETTINGS,
  },
});

const openAddProjectModal = (defaultProjectType) => ({
  type: EntryActionTypes.MODAL_OPEN,
  payload: {
    type: ModalTypes.ADD_PROJECT,
    params: {
      defaultType: defaultProjectType,
    },
  },
});

const openProjectSettingsModal = () => ({
  type: EntryActionTypes.MODAL_OPEN,
  payload: {
    type: ModalTypes.PROJECT_SETTINGS,
  },
});

const openBoardSettingsModal = (boardId) => ({
  type: EntryActionTypes.MODAL_OPEN,
  payload: {
    type: ModalTypes.BOARD_SETTINGS,
    params: {
      id: boardId,
    },
  },
});

const openBoardActivitiesModal = () => ({
  type: EntryActionTypes.MODAL_OPEN,
  payload: {
    type: ModalTypes.BOARD_ACTIVITIES,
  },
});

const closeModal = () => ({
  type: EntryActionTypes.MODAL_CLOSE,
  payload: {},
});

export default {
  openAdministrationModal,
  openUserSettingsModal,
  openAddProjectModal,
  openProjectSettingsModal,
  openBoardSettingsModal,
  openBoardActivitiesModal,
  closeModal,
};
