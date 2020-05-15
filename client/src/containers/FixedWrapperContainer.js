import { connect } from 'react-redux';

import { pathSelector } from '../selectors';
import FixedWrapper from '../components/FixedWrapper';

const mapStateToProps = (state) => {
  const { projectId } = pathSelector(state);

  return {
    projectId,
  };
};

export default connect(mapStateToProps)(FixedWrapper);
