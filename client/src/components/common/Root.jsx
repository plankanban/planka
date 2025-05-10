/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import { ThemeProvider, ToasterProvider } from '@gravity-ui/uikit';
// eslint-disable-next-line import/no-unresolved
import { toaster } from '@gravity-ui/uikit/toaster-singleton';
import { ReduxRouter } from '../../lib/redux-router';

import Paths from '../../constants/Paths';
import Login from './Login';
import Core from './Core';
import NotFound from './NotFound';

import 'react-datepicker/dist/react-datepicker.css';
import 'photoswipe/dist/photoswipe.css';
import '@gravity-ui/uikit/styles/styles.css';
import '../../lib/custom-ui/styles.css';

import '../../styles.module.scss';

function Root({ store, history }) {
  return (
    <Provider store={store}>
      <ReduxRouter history={history}>
        <ThemeProvider theme="light">
          <ToasterProvider toaster={toaster}>
            <Routes>
              <Route path={Paths.LOGIN} element={<Login />} />
              <Route path={Paths.OIDC_CALLBACK} element={<Login />} />
              <Route path={Paths.ROOT} element={<Core />} />
              <Route path={Paths.PROJECTS} element={<Core />} />
              <Route path={Paths.BOARDS} element={<Core />} />
              <Route path={Paths.CARDS} element={<Core />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ToasterProvider>
        </ThemeProvider>
      </ReduxRouter>
    </Provider>
  );
}

Root.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  store: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  /* eslint-enable react/forbid-prop-types */
};

export default Root;
