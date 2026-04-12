/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'semantic-ui-react';

import styles from './KeyboardShortcutsModal.module.scss';

const SHORTCUT_SECTIONS = [
  {
    title: 'Card Shortcuts (hover over a card)',
    shortcuts: [
      { keys: ['E', 'Enter'], description: 'Open card' },
      { keys: ['T'], description: 'Edit card title' },
      { keys: ['L'], description: 'Edit labels' },
      { keys: ['M'], description: 'Edit members' },
      { keys: ['D'], description: 'Edit due date' },
      { keys: ['V'], description: 'Archive card' },
      { keys: ['S'], description: 'Move card' },
      { keys: ['Space'], description: 'Assign/unassign yourself' },
      { keys: ['1', '–', '9', ',', '0'], description: 'Toggle label by position' },
    ],
  },
  {
    title: 'Board Shortcuts',
    shortcuts: [
      { keys: ['N'], description: 'Add card to hovered list' },
      { keys: ['Q'], description: 'Toggle "My Cards" filter' },
      { keys: ['?'], description: 'Show this help' },
    ],
  },
  {
    title: 'Clipboard',
    shortcuts: [
      { keys: ['Ctrl', '+', 'C'], description: 'Copy card' },
      { keys: ['Ctrl', '+', 'X'], description: 'Cut card' },
      { keys: ['Ctrl', '+', 'V'], description: 'Paste card into hovered list' },
    ],
  },
  {
    title: 'Card Modal',
    shortcuts: [
      { keys: ['←', '→'], description: 'Navigate between cards' },
      { keys: ['Esc'], description: 'Close card / modal' },
    ],
  },
];

const KeyboardShortcutsModal = React.memo(({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' || event.key === '?') {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <Modal open closeIcon size="small" centered onClose={onClose}>
      <Modal.Header>Keyboard Shortcuts</Modal.Header>
      <Modal.Content>
        <div className={styles.wrapper}>
          {SHORTCUT_SECTIONS.map((section) => (
            <div key={section.title} className={styles.section}>
              <h4 className={styles.sectionTitle}>{section.title}</h4>
              <div className={styles.shortcuts}>
                {section.shortcuts.map((shortcut) => (
                  <div key={shortcut.description} className={styles.shortcutRow}>
                    <div className={styles.keys}>
                      {shortcut.keys.map((key) =>
                        key === '+' || key === '–' || key === ',' ? (
                          <span key={key} className={styles.keySeparator}>
                            {key}
                          </span>
                        ) : (
                          <kbd key={key} className={styles.key}>
                            {key}
                          </kbd>
                        ),
                      )}
                    </div>
                    <span className={styles.description}>{shortcut.description}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Modal.Content>
    </Modal>
  );
});

KeyboardShortcutsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default KeyboardShortcutsModal;
