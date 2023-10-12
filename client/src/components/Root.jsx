import React from 'react';
import PropTypes from 'prop-types';
import { AuthProvider } from 'react-oidc-context';
import { Provider } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import { ReduxRouter } from '../lib/redux-router';

import Paths from '../constants/Paths';
import LoginContainer from '../containers/LoginContainer';
import CoreContainer from '../containers/CoreContainer';
import NotFound from './NotFound';

import 'react-datepicker/dist/react-datepicker.css';
import 'photoswipe/dist/photoswipe.css';
import 'easymde/dist/easymde.min.css';
import '../lib/custom-ui/styles.css';
import '../styles.module.scss';
import OidcLoginContainer from '../containers/OidcLoginContainer';
import './semantic.rtl.min.css';

function Root({ store, history, config }) {
  return (
    <AuthProvider
      authority={config.authority}
      client_id={config.clientId}
      redirect_uri={config.redirectUri}
      scope={config.scopes}
      onSigninCallback={() => {
        window.history.replaceState({}, document.title, window.location.pathname);
      }}
    >
      <Provider store={store}>
        <ReduxRouter history={history}>
          <Routes>
            <Route path={Paths.LOGIN} element={<LoginContainer />} />
            <Route path={Paths.OIDC_LOGIN} element={<OidcLoginContainer />} />
            <Route path={Paths.ROOT} element={<CoreContainer />} />
            <Route path={Paths.PROJECTS} element={<CoreContainer />} />
            <Route path={Paths.BOARDS} element={<CoreContainer />} />
            <Route path={Paths.CARDS} element={<CoreContainer />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ReduxRouter>
      </Provider>
    </AuthProvider>
  );
}
Root.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  store: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  config: PropTypes.object.isRequired,
  /* eslint-enable react/forbid-prop-types */
};

export default Root;
