/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Icon } from 'semantic-ui-react';

import history from '../../../history';
import Paths from '../../../constants/Paths';

import styles from './GhostError.module.scss';

const GhostError = React.memo(({ message }) => {
  const [t] = useTranslation();

  const eyesRef = useRef(null);

  const handleBackClick = useCallback(() => {
    history.back();
  }, []);

  const handleHomeClick = useCallback(() => {
    history.push(Paths.ROOT);
  }, []);

  useEffect(() => {
    let pageX = document.documentElement.clientWidth;
    let pageY = document.documentElement.clientHeight;

    const handleMouseMove = (event) => {
      if (!eyesRef.current) {
        return;
      }

      // Vertical axis
      const mouseY = event.pageY;
      const yAxis = ((pageY / 2 - mouseY) / pageY) * -300;

      // Horizontal axis
      const mouseX = event.pageX / -pageX;
      const xAxis = -mouseX * 100 - 100;

      // Apply transform to eyes
      eyesRef.current.style.transform = `translate(${xAxis}%, ${yAxis}%)`;
    };

    const handleResize = () => {
      pageX = document.documentElement.clientWidth;
      pageY = document.documentElement.clientHeight;
    };

    document.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.symbols}>
        <div className={styles.symbol} />
        <div className={styles.symbol} />
        <div className={styles.symbol} />
        <div className={styles.symbol} />
        <div className={styles.symbol} />
        <div className={styles.symbol} />
      </div>
      <div className={styles.ghost}>
        <div ref={eyesRef} className={styles.eyes}>
          <div className={styles.eyeLeft} />
          <div className={styles.eyeRight} />
        </div>
        <div className={styles.bottom}>
          <div />
          <div />
          <div />
          <div />
          <div />
        </div>
      </div>
      <div className={styles.shadow} />
      <div className={styles.message}>
        <h1 className={styles.title}>
          {t('common.whoops', {
            context: 'title',
          })}
        </h1>
        <div className={styles.text}>
          {t(message, {
            context: 'title',
          })}
        </div>
        {window.history.length > 1 && (
          <Button
            basic
            color="yellow"
            size="large"
            className={styles.button}
            onClick={handleBackClick}
          >
            <Icon name="arrow left" />
            {t('action.goBack')}
          </Button>
        )}
        <Button
          basic
          color="olive"
          size="large"
          className={styles.button}
          onClick={handleHomeClick}
        >
          <Icon name="home" />
          {t('action.goHome')}
        </Button>
      </div>
    </div>
  );
});

GhostError.propTypes = {
  message: PropTypes.string,
};

GhostError.defaultProps = {
  message: 'common.pageNotFound',
};

export default GhostError;
