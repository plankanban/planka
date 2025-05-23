/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import Projects from './Projects';

const GridProjectsView = React.memo(() => {
  const projectIds = useSelector(selectors.selectFilteredProjectIdsForCurrentUser);

  const dispatch = useDispatch();

  const handleAdd = useCallback(() => {
    dispatch(entryActions.openAddProjectModal());
  }, [dispatch]);

  return <Projects ids={projectIds} onAdd={handleAdd} />;
});

export default GridProjectsView;
