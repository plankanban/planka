import { useAuth } from 'react-oidc-context';
import PropTypes from 'prop-types';
import React from 'react';

let isLoggingIn = true;
const OidcLogin = React.memo(({ onAuthenticate }) => {
  const auth = useAuth();
  if (isLoggingIn && auth.user) {
    isLoggingIn = false;
    const { user } = auth;
    onAuthenticate(user);
  }
});

OidcLogin.propTypes = {
  onAuthenticate: PropTypes.func.isRequired,
};

export default OidcLogin;
