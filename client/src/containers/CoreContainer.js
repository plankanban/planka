import { connect } from 'react-redux';

import selectors from '../selectors';
import Core from '../components/Core';

const mapStateToProps = (state) => {
  const currentModal = selectors.selectCurrentModal(state);
  const currentProject = selectors.selectCurrentProject(state);

  return {
    currentModal,
    currentProject,
  };
};

export default connect(mapStateToProps)(Core);
