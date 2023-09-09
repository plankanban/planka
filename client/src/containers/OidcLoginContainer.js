import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import entryActions from '../entry-actions';
import OidcLogin from '../components/OIDC';

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
      onAuthenticate: entryActions.authenticate,
      onMessageDismiss: entryActions.clearAuthenticateError,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(OidcLogin);
