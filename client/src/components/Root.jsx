import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import { ReduxRouter } from '../lib/redux-router';

import Paths from '../constants/Paths';
import LoginWrapperContainer from '../containers/LoginWrapperContainer';
import CoreContainer from '../containers/CoreContainer';
import NotFound from './NotFound';

import 'react-datepicker/dist/react-datepicker.css';
import 'photoswipe/dist/photoswipe.css';
import 'easymde/dist/easymde.min.css';
import '../lib/custom-ui/styles.css';
import '../assets/css/font-awesome.css';
import '../styles.module.scss';

function Root({ store, history }) {
  return (
    <Provider store={store}>
      <ReduxRouter history={history}>
        <Routes>
          <Route path={Paths.LOGIN} element={<LoginWrapperContainer />} />
          <Route path={Paths.OIDC_CALLBACK} element={<LoginWrapperContainer />} />
          <Route path={Paths.ROOT} element={<CoreContainer />} />
          <Route path={Paths.PROJECTS} element={<CoreContainer />} />
          <Route path={Paths.BOARDS} element={<CoreContainer />} />
          <Route path={Paths.CARDS} element={<CoreContainer />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
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
