import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import selectors from '../selectors';
import entryActions from '../entry-actions';
import Login from '../components/Login';

const mapStateToProps = (state) => {
  const oidcConfig = selectors.selectOidcConfig(state);

  const {
    ui: {
      authenticateForm: { data: defaultData, isSubmitting, isSubmittingWithOidc, error },
    },
  } = state;

  return {
    defaultData,
    isSubmitting,
    isSubmittingWithOidc,
    error,
    withOidc: !!oidcConfig,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onAuthenticate: entryActions.authenticate,
      onAuthenticateWithOidc: entryActions.authenticateWithOidc,
      onMessageDismiss: entryActions.clearAuthenticateError,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Login);
