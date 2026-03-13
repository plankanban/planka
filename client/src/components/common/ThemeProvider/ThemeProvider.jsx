/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

import ThemeContext from '../../../contexts/ThemeContext';

const STORAGE_KEY = 'planka_theme_settings';

const DEFAULT_SETTINGS = {
  // Branding
  appName: 'PLANKA',

  // Theme mode
  mode: 'dark', // 'dark' or 'light'

  // Home background
  homeBackground: '', // CSS value or empty for default
  homeBackgroundType: 'default', // 'default', 'gradient', 'color', 'image'

  // Glassmorphism controls
  glass: {
    // Global toggle
    enabled: true,

    // Tint colors (RGB)
    tintRgb: '15, 23, 42',
    tintLightRgb: '255, 255, 255',

    // Column
    columnOpacity: 0.35,
    columnBlur: 16,
    columnBorderOpacity: 0.15,
    columnRadius: 12,

    // Card
    cardOpacity: 0.08,
    cardBlur: 8,
    cardBorderOpacity: 0.10,
    cardRadius: 8,

    // Header
    headerOpacity: 0.50,
    headerBlur: 12,
    headerBorderOpacity: 0.12,

    // Modal
    modalOpacity: 0.55,
    modalBlur: 24,
    modalBorderOpacity: 0.15,

    // Popup
    popupOpacity: 0.75,
    popupBlur: 20,
    popupBorderOpacity: 0.12,

    // Toolbar
    toolbarOpacity: 0.30,
    toolbarBlur: 8,

    // Text opacity
    textPrimaryOpacity: 0.95,
    textSecondaryOpacity: 0.65,
    textMutedOpacity: 0.45,
  },
};

const loadSettings = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        glass: {
          ...DEFAULT_SETTINGS.glass,
          ...(parsed.glass || {}),
        },
      };
    }
  } catch {
    // ignore
  }
  return DEFAULT_SETTINGS;
};

const applyThemeToDOM = (settings) => {
  const { glass, mode } = settings;
  const root = document.documentElement;

  if (!glass.enabled) {
    root.style.setProperty('--glass-column-blur', '0px');
    root.style.setProperty('--glass-card-blur', '0px');
    root.style.setProperty('--glass-header-blur', '0px');
    root.style.setProperty('--glass-modal-blur', '0px');
    root.style.setProperty('--glass-popup-blur', '0px');
    root.style.setProperty('--glass-toolbar-blur', '0px');
  } else {
    root.style.setProperty('--glass-column-blur', `${glass.columnBlur}px`);
    root.style.setProperty('--glass-card-blur', `${glass.cardBlur}px`);
    root.style.setProperty('--glass-header-blur', `${glass.headerBlur}px`);
    root.style.setProperty('--glass-modal-blur', `${glass.modalBlur}px`);
    root.style.setProperty('--glass-popup-blur', `${glass.popupBlur}px`);
    root.style.setProperty('--glass-toolbar-blur', `${glass.toolbarBlur}px`);
  }

  // Tint
  root.style.setProperty('--glass-tint-rgb', glass.tintRgb);
  root.style.setProperty('--glass-tint-light-rgb', glass.tintLightRgb);

  // Column
  root.style.setProperty('--glass-column-bg', `rgba(${glass.tintRgb}, ${glass.columnOpacity})`);
  root.style.setProperty('--glass-column-border', `rgba(${glass.tintLightRgb}, ${glass.columnBorderOpacity})`);
  root.style.setProperty('--glass-column-radius', `${glass.columnRadius}px`);

  // Card
  root.style.setProperty('--glass-card-bg', `rgba(${glass.tintLightRgb}, ${glass.cardOpacity})`);
  root.style.setProperty('--glass-card-border', `rgba(${glass.tintLightRgb}, ${glass.cardBorderOpacity})`);
  root.style.setProperty('--glass-card-radius', `${glass.cardRadius}px`);

  // Header
  root.style.setProperty('--glass-header-bg', `rgba(${glass.tintRgb}, ${glass.headerOpacity})`);
  root.style.setProperty('--glass-header-border', `rgba(${glass.tintLightRgb}, ${glass.headerBorderOpacity})`);

  // Modal
  root.style.setProperty('--glass-modal-bg', `rgba(${glass.tintRgb}, ${glass.modalOpacity})`);
  root.style.setProperty('--glass-modal-border', `rgba(${glass.tintLightRgb}, ${glass.modalBorderOpacity})`);

  // Popup
  root.style.setProperty('--glass-popup-bg', `rgba(${glass.tintRgb}, ${glass.popupOpacity})`);
  root.style.setProperty('--glass-popup-border', `rgba(${glass.tintLightRgb}, ${glass.popupBorderOpacity})`);

  // Toolbar
  root.style.setProperty('--glass-toolbar-bg', `rgba(0, 0, 0, ${glass.toolbarOpacity})`);

  // Text
  root.style.setProperty('--glass-text-primary', `rgba(255, 255, 255, ${glass.textPrimaryOpacity})`);
  root.style.setProperty('--glass-text-secondary', `rgba(255, 255, 255, ${glass.textSecondaryOpacity})`);
  root.style.setProperty('--glass-text-muted', `rgba(255, 255, 255, ${glass.textMutedOpacity})`);

  // Light mode overrides
  const appEl = document.getElementById('app');
  if (appEl) {
    if (mode === 'light') {
      appEl.classList.add('theme-light');
      appEl.classList.remove('theme-dark');
    } else {
      appEl.classList.add('theme-dark');
      appEl.classList.remove('theme-light');
    }
  }

  // Home background
  root.style.setProperty('--home-background', settings.homeBackground || '');
};

const ThemeProvider = React.memo(({ children }) => {
  const [settings, setSettings] = useState(loadSettings);

  useEffect(() => {
    applyThemeToDOM(settings);
  }, [settings]);

  const updateSettings = useCallback((updates) => {
    setSettings((prev) => {
      const next = {
        ...prev,
        ...updates,
        glass: {
          ...prev.glass,
          ...(updates.glass || {}),
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const value = useMemo(
    () => ({
      settings,
      updateSettings,
      resetSettings,
      defaults: DEFAULT_SETTINGS,
    }),
    [settings, updateSettings, resetSettings],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
});

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ThemeProvider;
