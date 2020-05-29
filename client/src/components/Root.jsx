import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import { ConnectedRouter } from 'connected-react-router';

import Paths from '../constants/Paths';
import LoginContainer from '../containers/LoginContainer';
import CoreWrapperContainer from '../containers/CoreWrapperContainer';
import NotFound from './NotFound';

import 'react-datepicker/dist/react-datepicker.css';
import '../lib/custom-ui/styles.css';

import '../styles.module.scss';

const Root = ({ store, history }) => (
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Switch>
        <Route exact path={Paths.LOGIN} component={LoginContainer} />
        <Route exact path={Paths.ROOT} component={CoreWrapperContainer} />
        <Route exact path={Paths.PROJECTS} component={CoreWrapperContainer} />
        <Route exact path={Paths.BOARDS} component={CoreWrapperContainer} />
        <Route exact path={Paths.CARDS} component={CoreWrapperContainer} />
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
