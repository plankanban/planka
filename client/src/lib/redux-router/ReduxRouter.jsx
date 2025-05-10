/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Router } from 'react-router-dom';

import { handleLocationChange } from './actions';

function ReduxRouter({ children, history, selector, basename }) {
  const state = useSelector(selector);
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    const unlisten = history.listen((nextState) => {
      dispatch(handleLocationChange(nextState.location, nextState.action));
    });

    dispatch(handleLocationChange(history.location, history.action, true));

    return unlisten;
  }, [history, dispatch]);

  return (
    <Router
      basename={basename}
      location={state.location}
      navigationType={state.action}
      navigator={history}
    >
      {children}
    </Router>
  );
}

ReduxRouter.propTypes = {
  children: PropTypes.element.isRequired,
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  selector: PropTypes.func,
  basename: PropTypes.string,
};

ReduxRouter.defaultProps = {
  selector: ({ router }) => router,
  basename: undefined,
};

export default ReduxRouter;
