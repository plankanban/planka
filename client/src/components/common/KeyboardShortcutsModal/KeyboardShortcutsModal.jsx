/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import entryActions from '../../../entry-actions';
import { useClosableModal } from '../../../hooks';

import styles from './KeyboardShortcutsModal.module.scss';

// Board shortcuts, mirrored from ShortcutsProvider's key handler. Grouped for
// readability; keys are shown as individual <kbd> tokens.
//
// A token that carries a word — a modifier name — is a locale key: a German
// keyboard says Strg. A token that is the bare character printed on the key is
// written as itself, since there is no word in it to translate.
const isLocaleKey = (token) => token.includes('.');

const GROUPS = [
  {
    titleKey: 'common.shortcutsClipboard',
    items: [
      {
        keys: ['common.keyCtrlOrCmd', 'C'],
        labelKey: 'common.shortcutCopyCard',
      },
      {
        keys: ['common.keyCtrlOrCmd', 'X'],
        labelKey: 'common.shortcutCutCard',
      },
      {
        keys: ['common.keyCtrlOrCmd', 'V'],
        labelKey: 'common.shortcutPasteCards',
      },
    ],
  },
  {
    titleKey: 'common.shortcutsHoveredCard',
    items: [
      { keys: ['E'], labelKey: 'common.shortcutOpenCard' },
      { keys: ['T'], labelKey: 'common.shortcutEditCardTitle' },
      { keys: ['L'], labelKey: 'common.shortcutOpenLabels' },
      { keys: ['M'], labelKey: 'common.shortcutOpenMembers' },
      { keys: ['V'], labelKey: 'common.shortcutArchiveCard' },
      { keys: ['1', '…', '0'], labelKey: 'common.shortcutToggleLabel' },
    ],
  },
  {
    titleKey: 'common.shortcutsBoard',
    items: [
      { keys: ['+'], labelKey: 'common.shortcutAddCard' },
      { keys: ['F'], labelKey: 'common.shortcutFocusFilter' },
    ],
  },
];

const KeyboardShortcutsModal = React.memo(() => {
  const dispatch = useDispatch();
  const [t] = useTranslation();

  const handleClose = useCallback(() => {
    dispatch(entryActions.closeModal());
  }, [dispatch]);

  const [ClosableModal] = useClosableModal();

  return (
    <ClosableModal closeIcon className={styles.modal} onClose={handleClose}>
      <ClosableModal.Content className={styles.content}>
        <h3 className={styles.title}>{t('common.keyboardShortcuts')}</h3>
        <div className={styles.groups}>
          {GROUPS.map((group) => (
            <div key={group.titleKey} className={styles.group}>
              <div className={styles.groupTitle}>{t(group.titleKey)}</div>
              {group.items.map((item) => (
                <div key={item.labelKey} className={styles.row}>
                  <span className={styles.keys}>
                    {item.keys.map((key) => (
                      <kbd key={key} className={styles.key}>
                        {isLocaleKey(key) ? t(key) : key}
                      </kbd>
                    ))}
                  </span>
                  <span className={styles.label}>{t(item.labelKey)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </ClosableModal.Content>
    </ClosableModal>
  );
});

export default KeyboardShortcutsModal;
