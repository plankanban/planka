import { connect } from 'react-redux';

import { isCoreInitializingSelector } from '../selectors';
import CoreWrapper from '../components/CoreWrapper';

const mapStateToProps = (state) => {
  const isCoreInitializing = isCoreInitializingSelector(state);

  return {
    isInitializing: isCoreInitializing,
    isSocketDisconnected: state.socket.isDisconnected,
  };
};

export default connect(mapStateToProps)(CoreWrapper);
