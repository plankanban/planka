/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Icon } from 'semantic-ui-react';
import { Popup } from '../../../lib/custom-ui';

import { useSteps } from '../../../hooks';
import ConfirmationStep from '../../common/ConfirmationStep';

import styles from './SavedFiltersStep.module.scss';

const StepTypes = {
  DELETE: 'DELETE',
};

// The saved-filter picker. Each row is a name (apply, or deactivate when it
// is the one already matching the board) plus an X that removes it after a
// confirmation, the same way every other destructive row in the app behaves.
//
// Opening this popup reads localStorage but applies nothing; a saved filter
// only reaches the board when a row is clicked.
const SavedFiltersStep = React.memo(({ items, activeId, onApply, onRemove, onBack, onClose }) => {
  const [t] = useTranslation();
  const [step, openStep, handleBack] = useSteps();

  const handleApplyClick = useCallback(
    ({
      currentTarget: {
        dataset: { id },
      },
    }) => {
      onApply(items.find((item) => item.id === id));
      onClose();
    },
    [items, onApply, onClose],
  );

  const handleRemoveClick = useCallback(
    ({
      currentTarget: {
        dataset: { id },
      },
    }) => {
      openStep(StepTypes.DELETE, {
        id,
      });
    },
    [openStep],
  );

  const handleRemoveConfirm = useCallback(() => {
    onRemove(step.params.id);
    handleBack();
  }, [handleBack, onRemove, step]);

  if (step && step.type === StepTypes.DELETE) {
    return (
      <ConfirmationStep
        title="common.deleteFilter"
        content="common.areYouSureYouWantToDeleteThisFilter"
        buttonContent="action.delete"
        onConfirm={handleRemoveConfirm}
        onBack={handleBack}
      />
    );
  }

  return (
    <>
      <Popup.Header onBack={onBack}>
        {t('common.savedFilters', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        {items.length === 0 ? (
          <div className={styles.empty}>{t('common.noSavedFilters')}</div>
        ) : (
          <div className={styles.items}>
            {items.map((item) => {
              const isActive = item.id === activeId;

              return (
                <div key={item.id} className={styles.item}>
                  <button
                    type="button"
                    data-id={item.id}
                    title={isActive ? t('common.deactivateFilter') : t('common.applyFilter')}
                    className={classNames(styles.itemButton, isActive && styles.itemButtonActive)}
                    onClick={handleApplyClick}
                  >
                    <Icon fitted name={isActive ? 'check' : 'filter'} className={styles.itemIcon} />
                    <span className={styles.itemName}>{item.name}</span>
                  </button>
                  <button
                    type="button"
                    data-id={item.id}
                    title={t('common.deleteFilter', {
                      context: 'title',
                    })}
                    className={styles.itemRemoveButton}
                    onClick={handleRemoveClick}
                  >
                    <Icon fitted name="trash alternate outline" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Popup.Content>
    </>
  );
});

SavedFiltersStep.propTypes = {
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  activeId: PropTypes.string,
  onApply: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

SavedFiltersStep.defaultProps = {
  activeId: undefined,
  onBack: undefined,
};

export default SavedFiltersStep;
