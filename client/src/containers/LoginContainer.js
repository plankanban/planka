import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { authenticate, clearAuthenticationError } from '../actions/entry';
import Login from '../components/Login';

const mapStateToProps = ({ login: { data: defaultData, isSubmitting, error: externalError } }) => {
  let error;

  if (externalError) {
    switch (externalError.message) {
      case 'Email does not exist':
        error = {
          message: 'emailDoesNotExist',
        };

        break;
      case 'Password is not valid':
        error = {
          message: 'invalidPassword',
        };

        break;
      case 'Failed to fetch':
        error = {
          type: 'warning',
          message: 'noInternetConnection',
        };

        break;
      case 'Network request failed':
        error = {
          type: 'warning',
          message: 'serverConnectionFailed',
        };

        break;
      default:
        error = {
          type: 'warning',
          message: 'unknownError',
        };
    }
  }

  return {
    defaultData,
    isSubmitting,
    error,
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    onAuthenticate: authenticate,
    onMessageDismiss: clearAuthenticationError,
  },
  dispatch,
);

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Login);
