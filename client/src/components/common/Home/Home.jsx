/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useContext, useMemo } from 'react';
import { useSelector } from 'react-redux';

import selectors from '../../../selectors';
import { HomeViews } from '../../../constants/Enums';
import { ThemeContext } from '../../../contexts';
import GridProjectsView from './GridProjectsView';
import GroupedProjectsView from './GroupedProjectsView';

import styles from './Home.module.scss';

const Home = React.memo(() => {
  const view = useSelector(selectors.selectHomeView);
  const themeContext = useContext(ThemeContext);

  const homeStyle = useMemo(() => {
    if (!themeContext || !themeContext.settings.homeBackground) {
      return undefined;
    }
    return { background: themeContext.settings.homeBackground };
  }, [themeContext]);

  let View;
  switch (view) {
    case HomeViews.GRID_PROJECTS:
      View = GridProjectsView;

      break;
    case HomeViews.GROUPED_PROJECTS:
      View = GroupedProjectsView;

      break;
    default:
  }

  return (
    <div className={styles.wrapper} style={homeStyle}>
      <View />
    </div>
  );
});

export default Home;
