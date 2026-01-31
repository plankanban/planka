/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Tab } from 'semantic-ui-react';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';

import styles from './AppearancePane.module.scss';

const DEFAULT_THEME = {
  cardBackground: '#f8f9fa',
  cardBorder: '#e9ecef',
  cardShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
  cardHoverBackground: '#f1f3f5',
  cardHoverShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
};

const THEME_KEYS = [
  'cardBackground',
  'cardBorder',
  'cardShadow',
  'cardHoverBackground',
  'cardHoverShadow',
];

const AppearancePane = React.memo(() => {
  const user = useSelector(selectors.selectCurrentUser);
  const dispatch = useDispatch();
  const [t] = useTranslation();

  const savedTheme = user?.themeSettings || {};
  // Initialize form once from saved theme; do not sync from savedTheme on every render or
  // selector ref changes would reset the form and wipe out user edits.
  const [formTheme, setFormTheme] = useState(() => ({ ...DEFAULT_THEME, ...savedTheme }));

  const handleChange = useCallback((key, value) => {
    setFormTheme((prev) => ({ ...prev, [key]: value || DEFAULT_THEME[key] }));
  }, []);

  const handleApply = useCallback(() => {
    dispatch(entryActions.updateCurrentUserTheme(formTheme));
  }, [dispatch, formTheme]);

  const handleReset = useCallback(() => {
    setFormTheme({ ...DEFAULT_THEME });
    dispatch(entryActions.updateCurrentUserTheme(DEFAULT_THEME));
  }, [dispatch]);

  const isDirty =
    THEME_KEYS.some((key) => formTheme[key] !== (savedTheme[key] ?? DEFAULT_THEME[key])) ||
    (Object.keys(savedTheme).length === 0 && THEME_KEYS.some((key) => formTheme[key] !== DEFAULT_THEME[key]));

  return (
    <Tab.Pane attached={false} className={styles.wrapper}>
      <div className={styles.previewSection}>
        <div className={styles.previewLabel}>{t('common.cardPreview', { context: 'appearance' })}</div>
        <div
          className={styles.previewCard}
          style={{
            background: formTheme.cardBackground,
            border: `1px solid ${formTheme.cardBorder}`,
            boxShadow: formTheme.cardShadow,
          }}
        >
          <div className={styles.previewCardTitle}>Sample card</div>
        </div>
        <div
          className={`${styles.previewCard} ${styles.hover}`}
          style={{
            background: formTheme.cardHoverBackground,
            border: `1px solid ${formTheme.cardBorder}`,
            boxShadow: formTheme.cardHoverShadow,
          }}
        >
          <div className={styles.previewCardTitle}>Hover state</div>
        </div>
      </div>
      <div className={styles.fieldRow}>
        <label className={styles.fieldLabel} htmlFor="theme-cardBackground">
          {t('common.cardBackground', { context: 'appearance' })}
        </label>
        <input
          id="theme-cardBackground"
          type="color"
          className={styles.colorInput}
          value={formTheme.cardBackground}
          onChange={(e) => handleChange('cardBackground', e.target.value)}
        />
        <input
          type="text"
          className={styles.textInput}
          value={formTheme.cardBackground}
          onChange={(e) => handleChange('cardBackground', e.target.value)}
        />
      </div>
      <div className={styles.fieldRow}>
        <label className={styles.fieldLabel} htmlFor="theme-cardBorder">
          {t('common.cardBorder', { context: 'appearance' })}
        </label>
        <input
          id="theme-cardBorder"
          type="color"
          className={styles.colorInput}
          value={formTheme.cardBorder}
          onChange={(e) => handleChange('cardBorder', e.target.value)}
        />
        <input
          type="text"
          className={styles.textInput}
          value={formTheme.cardBorder}
          onChange={(e) => handleChange('cardBorder', e.target.value)}
        />
      </div>
      <div className={styles.fieldRow}>
        <label className={styles.fieldLabel} htmlFor="theme-cardShadow">
          {t('common.cardShadow', { context: 'appearance' })}
        </label>
        <input
          id="theme-cardShadow"
          type="text"
          className={styles.textInput}
          value={formTheme.cardShadow}
          onChange={(e) => handleChange('cardShadow', e.target.value)}
        />
      </div>
      <div className={styles.fieldRow}>
        <label className={styles.fieldLabel} htmlFor="theme-cardHoverBackground">
          {t('common.cardHoverBackground', { context: 'appearance' })}
        </label>
        <input
          id="theme-cardHoverBackground"
          type="color"
          className={styles.colorInput}
          value={formTheme.cardHoverBackground}
          onChange={(e) => handleChange('cardHoverBackground', e.target.value)}
        />
        <input
          type="text"
          className={styles.textInput}
          value={formTheme.cardHoverBackground}
          onChange={(e) => handleChange('cardHoverBackground', e.target.value)}
        />
      </div>
      <div className={styles.fieldRow}>
        <label className={styles.fieldLabel} htmlFor="theme-cardHoverShadow">
          {t('common.cardHoverShadow', { context: 'appearance' })}
        </label>
        <input
          id="theme-cardHoverShadow"
          type="text"
          className={styles.textInput}
          value={formTheme.cardHoverShadow}
          onChange={(e) => handleChange('cardHoverShadow', e.target.value)}
        />
      </div>
      <div className={styles.buttons}>
        <Button primary disabled={!isDirty} content={t('action.apply')} onClick={handleApply} />
        <Button content={t('action.resetToDefault')} onClick={handleReset} />
      </div>
    </Tab.Pane>
  );
});

export default AppearancePane;
