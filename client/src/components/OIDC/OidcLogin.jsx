import { useAuth } from 'oidc-react';
import PropTypes from 'prop-types';
import React from 'react';

let isLoggingIn = true;
const OidcLogin = React.memo(({ onAuthenticate }) => {
  const auth = useAuth();
  if (isLoggingIn && auth.userData) {
    isLoggingIn = false;
    const user = auth.userData;
    onAuthenticate(user);
  }
});

OidcLogin.propTypes = {
  onAuthenticate: PropTypes.func.isRequired,
};

export default OidcLogin;
