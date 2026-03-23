/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Popup } from '../../../lib/custom-ui';
import ThemeContext from '../../../contexts/ThemeContext';

import styles from './ThemeSettingsStep.module.scss';

const HOME_BACKGROUNDS = [
  { value: '', label: 'Default' },
  { value: 'linear-gradient(135deg, #0f172a, #1e293b)', label: 'Midnight' },
  { value: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)', label: 'Deep Space' },
  { value: 'linear-gradient(135deg, #2d1b69, #11001c)', label: 'Purple Night' },
  { value: 'linear-gradient(135deg, #134e5e, #71b280)', label: 'Forest' },
  { value: 'linear-gradient(135deg, #0c0c0c, #1a1a1a)', label: 'Charcoal' },
  { value: 'linear-gradient(135deg, #141e30, #243b55)', label: 'Navy' },
  { value: 'linear-gradient(135deg, #232526, #414345)', label: 'Graphite' },
  { value: 'linear-gradient(135deg, #200122, #6f0000)', label: 'Wine' },
  { value: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)', label: 'Ocean' },
  { value: 'linear-gradient(135deg, #3c1053, #ad5389)', label: 'Orchid' },
  { value: 'linear-gradient(135deg, #1f4037, #99f2c8)', label: 'Emerald' },
];

const TINT_PRESETS = [
  { rgb: '15, 23, 42', label: 'Slate', color: '#0f172a' },
  { rgb: '0, 0, 0', label: 'Black', color: '#000000' },
  { rgb: '30, 41, 59', label: 'Blue Gray', color: '#1e293b' },
  { rgb: '17, 24, 39', label: 'Gray', color: '#111827' },
  { rgb: '45, 27, 105', label: 'Purple', color: '#2d1b69' },
  { rgb: '19, 78, 94', label: 'Teal', color: '#134e5e' },
  { rgb: '15, 32, 39', label: 'Dark Teal', color: '#0f2027' },
  { rgb: '60, 16, 83', label: 'Deep Purple', color: '#3c1053' },
];

const ThemeSettingsStep = React.memo(({ onClose }) => {
  const { settings, updateSettings, resetSettings } = useContext(ThemeContext);

  const handleAppNameChange = useCallback(
    (e) => {
      updateSettings({ appName: e.target.value });
    },
    [updateSettings],
  );

  const handleModeChange = useCallback(
    (mode) => {
      updateSettings({ mode });
    },
    [updateSettings],
  );

  const handleHomeBackgroundChange = useCallback(
    (value) => {
      updateSettings({
        homeBackground: value,
        homeBackgroundType: value ? 'gradient' : 'default',
      });
    },
    [updateSettings],
  );

  const handleGlassToggle = useCallback(() => {
    updateSettings({
      glass: { enabled: !settings.glass.enabled },
    });
  }, [settings.glass.enabled, updateSettings]);

  const handleGlassChange = useCallback(
    (key, value) => {
      updateSettings({
        glass: { [key]: parseFloat(value) },
      });
    },
    [updateSettings],
  );

  const handleTintChange = useCallback(
    (rgb) => {
      updateSettings({
        glass: { tintRgb: rgb },
      });
    },
    [updateSettings],
  );

  const handleReset = useCallback(() => {
    resetSettings();
    onClose();
  }, [resetSettings, onClose]);

  const renderSlider = (label, key, min, max, step) => (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <div className={classNames(styles.fieldControl)} style={{ display: 'flex', alignItems: 'center' }}>
        <input
          type="range"
          className={styles.slider}
          min={min}
          max={max}
          step={step}
          value={settings.glass[key]}
          onChange={(e) => handleGlassChange(key, e.target.value)}
        />
        <span className={styles.sliderValue}>
          {typeof settings.glass[key] === 'number' && settings.glass[key] < 1
            ? `${Math.round(settings.glass[key] * 100)}%`
            : settings.glass[key]}
        </span>
      </div>
    </div>
  );

  return (
    <>
      <Popup.Header>Theme Settings</Popup.Header>
      <Popup.Content>
        <div className={styles.wrapper}>
          {/* Branding */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Branding</div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>App Name</span>
              <div className={styles.fieldControl}>
                <input
                  type="text"
                  className={styles.textInput}
                  value={settings.appName}
                  onChange={handleAppNameChange}
                  placeholder="PLANKA"
                />
              </div>
            </div>
          </div>

          <hr className={styles.divider} />

          {/* Theme Mode */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Theme Mode</div>
            <div className={styles.modeButtons}>
              <button
                type="button"
                className={classNames(
                  styles.modeButton,
                  settings.mode === 'dark' && styles.modeButtonActive,
                )}
                onClick={() => handleModeChange('dark')}
              >
                Dark
              </button>
              <button
                type="button"
                className={classNames(
                  styles.modeButton,
                  settings.mode === 'light' && styles.modeButtonActive,
                )}
                onClick={() => handleModeChange('light')}
              >
                Light
              </button>
            </div>
          </div>

          <hr className={styles.divider} />

          {/* Home Background */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Home Background</div>
            <div className={styles.bgGrid}>
              {HOME_BACKGROUNDS.map((bg) => (
                <button
                  key={bg.value || 'default'}
                  type="button"
                  className={classNames(
                    styles.bgSwatch,
                    settings.homeBackground === bg.value && styles.bgSwatchActive,
                  )}
                  style={{
                    background: bg.value || '#22252a',
                  }}
                  title={bg.label}
                  onClick={() => handleHomeBackgroundChange(bg.value)}
                />
              ))}
            </div>
          </div>

          <hr className={styles.divider} />

          {/* Glassmorphism Controls */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Glassmorphism</div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Enable Effects</span>
              <div className={styles.fieldControl}>
                <button
                  type="button"
                  className={classNames(
                    styles.toggle,
                    settings.glass.enabled && styles.toggleActive,
                  )}
                  onClick={handleGlassToggle}
                />
              </div>
            </div>
          </div>

          {settings.glass.enabled && (
            <>
              <hr className={styles.divider} />

              {/* Glass Tint */}
              <div className={styles.section}>
                <div className={styles.sectionTitle}>Glass Tint Color</div>
                <div className={styles.bgGrid}>
                  {TINT_PRESETS.map((preset) => (
                    <button
                      key={preset.rgb}
                      type="button"
                      className={classNames(
                        styles.bgSwatch,
                        settings.glass.tintRgb === preset.rgb && styles.bgSwatchActive,
                      )}
                      style={{ background: preset.color }}
                      title={preset.label}
                      onClick={() => handleTintChange(preset.rgb)}
                    />
                  ))}
                </div>
              </div>

              <hr className={styles.divider} />

              {/* Header */}
              <div className={styles.section}>
                <div className={styles.sectionTitle}>Header</div>
                {renderSlider('Opacity', 'headerOpacity', 0, 1, 0.05)}
                {renderSlider('Blur', 'headerBlur', 0, 40, 1)}
              </div>

              <hr className={styles.divider} />

              {/* Columns */}
              <div className={styles.section}>
                <div className={styles.sectionTitle}>Columns / Swim Lanes</div>
                {renderSlider('Opacity', 'columnOpacity', 0, 1, 0.05)}
                {renderSlider('Blur', 'columnBlur', 0, 40, 1)}
                {renderSlider('Border', 'columnBorderOpacity', 0, 0.5, 0.01)}
                {renderSlider('Radius', 'columnRadius', 0, 24, 1)}
              </div>

              <hr className={styles.divider} />

              {/* Cards */}
              <div className={styles.section}>
                <div className={styles.sectionTitle}>Cards</div>
                {renderSlider('Opacity', 'cardOpacity', 0, 0.5, 0.01)}
                {renderSlider('Blur', 'cardBlur', 0, 24, 1)}
                {renderSlider('Border', 'cardBorderOpacity', 0, 0.5, 0.01)}
                {renderSlider('Radius', 'cardRadius', 0, 20, 1)}
              </div>

              <hr className={styles.divider} />

              {/* Modals & Popups */}
              <div className={styles.section}>
                <div className={styles.sectionTitle}>Modals & Popups</div>
                {renderSlider('Modal Opacity', 'modalOpacity', 0, 1, 0.05)}
                {renderSlider('Modal Blur', 'modalBlur', 0, 48, 1)}
                {renderSlider('Popup Opacity', 'popupOpacity', 0, 1, 0.05)}
                {renderSlider('Popup Blur', 'popupBlur', 0, 40, 1)}
              </div>

              <hr className={styles.divider} />

              {/* Toolbar */}
              <div className={styles.section}>
                <div className={styles.sectionTitle}>Toolbar</div>
                {renderSlider('Opacity', 'toolbarOpacity', 0, 1, 0.05)}
                {renderSlider('Blur', 'toolbarBlur', 0, 24, 1)}
              </div>

              <hr className={styles.divider} />

              {/* Text */}
              <div className={styles.section}>
                <div className={styles.sectionTitle}>Text Opacity</div>
                {renderSlider('Primary', 'textPrimaryOpacity', 0.5, 1, 0.05)}
                {renderSlider('Secondary', 'textSecondaryOpacity', 0.3, 1, 0.05)}
                {renderSlider('Muted', 'textMutedOpacity', 0.1, 0.8, 0.05)}
              </div>
            </>
          )}

          <hr className={styles.divider} />

          <button type="button" className={styles.resetButton} onClick={handleReset}>
            Reset All to Defaults
          </button>
        </div>
      </Popup.Content>
    </>
  );
});

ThemeSettingsStep.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default ThemeSettingsStep;
