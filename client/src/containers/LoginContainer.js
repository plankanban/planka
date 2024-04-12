import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import selectors from '../selectors';
import entryActions from '../entry-actions';
import Login from '../components/Login';

const mapStateToProps = (state) => {
  const oidcConfig = selectors.selectOidcConfig(state);

  const {
    ui: {
      authenticateForm: { data: defaultData, isSubmitting, isSubmittingUsingOidc, error },
    },
  } = state;

  return {
    defaultData,
    isSubmitting,
    isSubmittingUsingOidc,
    error,
    withOidc: !!oidcConfig,
    isOidcEnforced: !!oidcConfig && oidcConfig.isEnforced,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onAuthenticate: entryActions.authenticate,
      onAuthenticateUsingOidc: entryActions.authenticateUsingOidc,
      onMessageDismiss: entryActions.clearAuthenticateError,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Login);
