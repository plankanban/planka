import { connect } from 'react-redux';

import { isCoreInitializingSelector } from '../selectors';
import CoreWrapper from '../components/CoreWrapper';

const mapStateToProps = (state) => {
  const isCoreInitializing = isCoreInitializingSelector(state);

  return {
    isInitializing: isCoreInitializing,
  };
};

export default connect(mapStateToProps)(CoreWrapper);
