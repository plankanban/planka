import { connect } from 'react-redux';

import selectors from '../selectors';
import CoreWrapper from '../components/CoreWrapper';

const mapStateToProps = (state) => {
  const isCoreInitializing = selectors.selectIsCoreInitializing(state);

  return {
    isInitializing: isCoreInitializing,
    isSocketDisconnected: state.socket.isDisconnected,
  };
};

export default connect(mapStateToProps)(CoreWrapper);
