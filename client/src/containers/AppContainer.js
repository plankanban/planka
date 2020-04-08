import { connect } from 'react-redux';

import { currentModalSelector } from '../selectors';
import ModalTypes from '../constants/ModalTypes';
import App from '../components/App';

const mapStateToProps = (state) => {
  const currentModal = currentModalSelector(state);

  return {
    isUsersModalOpened: currentModal === ModalTypes.USERS,
    isUserSettingsModalOpened: currentModal === ModalTypes.USER_SETTINGS,
    isAddProjectModalOpened: currentModal === ModalTypes.ADD_PROJECT,
  };
};

export default connect(mapStateToProps)(App);
