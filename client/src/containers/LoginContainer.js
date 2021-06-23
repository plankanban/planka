import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { authenticate, clearAuthenticateError } from '../actions/entry';
import Login from '../components/Login';

const mapStateToProps = ({
  ui: {
    authenticateForm: { data: defaultData, isSubmitting, error },
  },
}) => ({
  defaultData,
  isSubmitting,
  error,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onAuthenticate: authenticate,
      onMessageDismiss: clearAuthenticateError,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Login);
