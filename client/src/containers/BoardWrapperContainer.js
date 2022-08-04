import { connect } from 'react-redux';

import selectors from '../selectors';
import BoardWrapper from '../components/BoardWrapper';

const mapStateToProps = (state) => {
  const { type, isFetching } = selectors.selectCurrentBoard(state);

  return {
    type,
    isFetching,
  };
};

export default connect(mapStateToProps)(BoardWrapper);
