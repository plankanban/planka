import { connect } from 'react-redux';

import { currentModalSelector } from '../selectors';
import App from '../components/App';

const mapStateToProps = (state) => {
  const currentModal = currentModalSelector(state);

  return {
    currentModal,
  };
};

export default connect(mapStateToProps)(App);
