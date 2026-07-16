/*!
 * Copyright (c) 2026 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import selectors from '../../../selectors';

import styles from './PromoBanner.module.scss';

const PRO_URL = 'https://planka.app/pro?ref=app-banner';
const DISMISS_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
const CYCLE_INTERVAL_MS = 8000;
const CSS_VAR = '--promo-banner-height';

const FEATURES = ['proFeatureCalendar', 'proFeatureRecurringCards', 'proFeatureGuestRoles'];

// Alternates: main, sub1, main, sub2, main, sub3
const TEXTS = [
  'discoverPlankaPro',
  FEATURES[0],
  'discoverPlankaPro',
  FEATURES[1],
  'discoverPlankaPro',
  FEATURES[2],
];

function getDismissKey(userId) {
  return `planka_proBannerDismissed_${userId}`;
}

function isBannerDismissed(userId) {
  const stored = localStorage.getItem(getDismissKey(userId));
  if (!stored) return false;
  return Date.now() - Date.parse(stored) < DISMISS_DURATION_MS;
}

const PromoBanner = React.memo(() => {
  const userId = useSelector(selectors.selectCurrentUserId);

  const [dismissed, setDismissed] = useState(() => isBannerDismissed(userId));
  const [textIndex, setTextIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  const wrapperRef = useRef(null);
  const [t] = useTranslation();

  useEffect(() => {
    if (dismissed) {
      document.documentElement.style.removeProperty(CSS_VAR);
      return undefined;
    }

    const height = wrapperRef.current ? wrapperRef.current.offsetHeight : 0;
    document.documentElement.style.setProperty(CSS_VAR, `${height}px`);

    return () => document.documentElement.style.removeProperty(CSS_VAR);
  }, [dismissed]);

  useEffect(() => {
    if (dismissed) return undefined;

    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setTextIndex((i) => (i + 1) % TEXTS.length);
        setVisible(true);
      }, 400);
    }, CYCLE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [dismissed]);

  const handleDismiss = useCallback(
    (e) => {
      e.preventDefault();
      localStorage.setItem(getDismissKey(userId), new Date().toISOString());
      setDismissed(true);
    },
    [userId],
  );

  if (dismissed) return null;

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <a
        href={PRO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`${styles.textLink} ${visible ? styles.textVisible : styles.textHidden}`}
      >
        {t(`common.${TEXTS[textIndex]}`)}
        <span className={styles.externalIcon}>↗</span>
      </a>
      <button
        type="button"
        title={t('common.dismissProBannerFor30Days')}
        className={styles.closeButton}
        onClick={handleDismiss}
      >
        ×
      </button>
    </div>
  );
});

export default PromoBanner;
