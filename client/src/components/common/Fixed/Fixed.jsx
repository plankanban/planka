/*!
 * Copyright (c) 2026 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useLayoutEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import selectors from '../../../selectors';
import Header from '../Header';
import PromoBanner from '../PromoBanner/PromoBanner';
import HomeActions from '../HomeActions';
import Project from '../../projects/Project';
import BoardActions from '../../boards/BoardActions';

import styles from './Fixed.module.scss';

const CSS_VAR = '--pk-fixed-height';

const Fixed = React.memo(() => {
  const { projectId } = useSelector(selectors.selectPath);
  const board = useSelector(selectors.selectCurrentBoard);

  const wrapperRef = useRef(null);

  // The content below starts where this bar ends, and its height changes with the page,
  // the banner and the window width, so it is published as a variable rather than guessed
  useLayoutEffect(() => {
    const { style } = document.documentElement;

    const resizeObserver = new ResizeObserver(([entry]) => {
      style.setProperty(CSS_VAR, `${entry.target.offsetHeight}px`);
    });

    resizeObserver.observe(wrapperRef.current);

    return () => {
      resizeObserver.disconnect();
      style.removeProperty(CSS_VAR);
    };
  }, []);

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <Header />
      <PromoBanner />
      {projectId === undefined && <HomeActions />}
      {projectId && <Project />}
      {board && !board.isFetching && <BoardActions />}
    </div>
  );
});

export default Fixed;
