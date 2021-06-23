import { connect } from 'react-redux';

import { currentModalSelector } from '../selectors';
import ModalTypes from '../constants/ModalTypes';
import Project from '../components/Project';

const mapStateToProps = (state) => {
  const currentModal = currentModalSelector(state);

  return {
    isSettingsModalOpened: currentModal === ModalTypes.PROJECT_SETTINGS,
  };
};

export default connect(mapStateToProps)(Project);
