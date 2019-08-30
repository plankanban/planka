import { connect } from 'react-redux';

import SocketStatuses from '../constants/SocketStatuses';
import SocketStatus from '../components/SocketStatus';

const mapStateToProps = ({ socket: { status } }) => ({
  isDisconnected: status === SocketStatuses.DISCONNECTED,
  isReconnected: status === SocketStatuses.RECONNECTED,
});

export default connect(mapStateToProps)(SocketStatus);
