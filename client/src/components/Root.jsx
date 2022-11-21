import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import { HistoryRouter as Router } from 'redux-first-history/rr6';

import Paths from '../constants/Paths';
import LoginContainer from '../containers/LoginContainer';
import CoreWrapperContainer from '../containers/CoreWrapperContainer';
import NotFound from './NotFound';

import 'react-datepicker/dist/react-datepicker.css';
import 'photoswipe/dist/photoswipe.css';
import 'easymde/dist/easymde.min.css';
import '../lib/custom-ui/styles.css';

import '../styles.module.scss';

function Root({ store, history }) {
  return (
    <Provider store={store}>
      <Router history={history}>
        <Routes>
          <Route path={Paths.LOGIN} element={<LoginContainer />} />
          <Route path={Paths.ROOT} element={<CoreWrapperContainer />} />
          <Route path={Paths.PROJECTS} element={<CoreWrapperContainer />} />
          <Route path={Paths.BOARDS} element={<CoreWrapperContainer />} />
          <Route path={Paths.CARDS} element={<CoreWrapperContainer />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
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
