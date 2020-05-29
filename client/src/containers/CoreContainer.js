import { connect } from 'react-redux';

import { currentModalSelector, currentProjectSelector } from '../selectors';
import Core from '../components/Core';

const mapStateToProps = (state) => {
  const currentModal = currentModalSelector(state);
  const currentProject = currentProjectSelector(state);

  return {
    currentModal,
    currentProject,
  };
};

export default connect(mapStateToProps)(Core);
