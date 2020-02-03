import { connect } from 'react-redux';

import { currentBoardSelector } from '../selectors';
import BoardWrapper from '../components/BoardWrapper';

const mapStateToProps = state => {
  const { isFetching } = currentBoardSelector(state);

  return {
    isFetching,
  };
};

export default connect(mapStateToProps)(BoardWrapper);
