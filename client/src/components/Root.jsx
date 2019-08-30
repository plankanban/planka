import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import { ConnectedRouter } from 'connected-react-router';

import Paths from '../constants/Paths';
import LoginContainer from '../containers/LoginContainer';
import AppWrapperContainer from '../containers/AppWrapperContainer';
import NotFound from './NotFound';

import 'react-datepicker/dist/react-datepicker.css';
import '../lib/custom-ui/index.css';

import '../index.css';

const Root = ({ store, history }) => (
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Switch>
        <Route exact path={Paths.LOGIN} component={LoginContainer} />
        <Route exact path={Paths.ROOT} component={AppWrapperContainer} />
        <Route exact path={Paths.PROJECTS} component={AppWrapperContainer} />
        <Route exact path={Paths.BOARDS} component={AppWrapperContainer} />
        <Route exact path={Paths.CARDS} component={AppWrapperContainer} />
        <Route path="*" component={NotFound} />
      </Switch>
    </ConnectedRouter>
  </Provider>
);

Root.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  store: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  /* eslint-enable react/forbid-prop-types */
};

export default Root;
