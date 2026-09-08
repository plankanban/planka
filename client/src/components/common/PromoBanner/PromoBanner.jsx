/*!
 * Copyright (c) 2026 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import selectors from '../../../selectors';
import { UserRoles } from '../../../constants/Enums';

import styles from './PromoBanner.module.scss';

const TRIAL_URL = 'https://planka.app/trial?ref=app-banner';
const PRO_URL = 'https://planka.app/pro?ref=app-banner';
const DISMISS_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
const CYCLE_INTERVAL_MS = 8000;
const CSS_VAR = '--promo-banner-height';

// The first three are the only ones every locale translates, so they lead.
const FEATURES = [
  'proFeatureCalendar',
  'proFeatureRecurringCards',
  'proFeatureGuestRoles',
  'proFeatureMobile',
  'proFeatureThemes',
  'proFeatureDashboard',
  'proFeatureTimeline',
  'proFeatureExport',
  'proFeatureSso',
];

// Alternates the headline with one feature at a time: main, first, main, second, …
// A full pass takes over two minutes, longer than most visits, so the list starts at
// an offset picked per visit. Without it the tail of it would never be seen by anyone.
function buildTexts(mainText, offset) {
  const rotated = [...FEATURES.slice(offset), ...FEATURES.slice(0, offset)];
  return rotated.flatMap((feature) => [mainText, feature]);
}

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

  const isAdmin = useSelector(
    (state) => selectors.selectCurrentUser(state).role === UserRoles.ADMIN,
  );

  const [dismissed, setDismissed] = useState(() => isBannerDismissed(userId));
  const [textIndex, setTextIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [featureOffset] = useState(() => Math.floor(Math.random() * FEATURES.length));

  const wrapperRef = useRef(null);
  const [t, i18n] = useTranslation();
  const { resolvedLanguage } = i18n;

  // proTrialSelfHosted is new and exists in a couple of languages; discoverPlankaPro exists
  // in all of them. The headline opens every session and fills every second slot, so where
  // the sharper line is untranslated we take the softer one rather than a line of English.
  // The link still goes to the trial. As translations land, exists() flips on its own.
  const texts = useMemo(() => {
    const hasTrialText = i18n.exists('common.proTrialSelfHosted', {
      lng: resolvedLanguage,
      fallbackLng: false,
    });

    return buildTexts(
      isAdmin && hasTrialText ? 'proTrialSelfHosted' : 'discoverPlankaPro',
      featureOffset,
    );
  }, [isAdmin, featureOffset, i18n, resolvedLanguage]);

  // An admin can put a trial on their own server today, so they go straight to it;
  // everyone else gets the overview, which leads on to the trial in its own time.
  // The landing path is what tells the two groups apart in the referral figures.
  const href = isAdmin ? TRIAL_URL : PRO_URL;

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
        setTextIndex((i) => (i + 1) % texts.length);
        setVisible(true);
      }, 400);
    }, CYCLE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [dismissed, texts]);

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
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${styles.textLink} ${visible ? styles.textVisible : styles.textHidden}`}
      >
        {t(`common.${texts[textIndex]}`)}
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
