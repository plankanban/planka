import { connect } from 'react-redux';

import { isAppInitializingSelector } from '../selectors';
import AppWrapper from '../components/AppWrapper';

const mapStateToProps = (state) => {
  const isAppInitializing = isAppInitializingSelector(state);

  return {
    isInitializing: isAppInitializing,
  };
};

export default connect(mapStateToProps)(AppWrapper);
