import ActionTypes from '../constants/ActionTypes';

const openModal = (type) => ({
  type: ActionTypes.MODAL_OPEN,
  payload: {
    type,
  },
});

const closeModal = () => ({
  type: ActionTypes.MODAL_CLOSE,
  payload: {},
});

export default {
  openModal,
  closeModal,
};
