import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Menu } from 'semantic-ui-react';
import { withPopup } from '../../lib/popup';
import { Popup } from '../../lib/custom-ui';

import { useSteps } from '../../hooks';
import DeleteStep from '../DeleteStep';

import styles from './ActionsPopup.module.css';

const StepTypes = {
  DELETE: 'DELETE',
};

const ActionsStep = React.memo(({ onNameEdit, onCardAdd, onDelete, onClose }) => {
  const [t] = useTranslation();
  const [step, openStep, handleBack] = useSteps();

  const handleNameEditClick = useCallback(() => {
    onNameEdit();
    onClose();
  }, [onNameEdit, onClose]);

  const handleCardAddClick = useCallback(() => {
    onCardAdd();
    onClose();
  }, [onCardAdd, onClose]);

  const handleDeleteClick = useCallback(() => {
    openStep(StepTypes.DELETE);
  }, [openStep]);

  if (step && step.type === StepTypes.DELETE) {
    return (
      <DeleteStep
        title={t('common.deleteList', {
          context: 'title',
        })}
        content={t('common.areYouSureYouWantToDeleteThisList')}
        buttonContent={t('action.deleteList')}
        onConfirm={onDelete}
        onBack={handleBack}
      />
    );
  }

  return (
    <>
      <Popup.Header>
        {t('common.listActions', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Menu secondary vertical className={styles.menu}>
          <Menu.Item className={styles.menuItem} onClick={handleNameEditClick}>
            {t('action.editTitle', {
              context: 'title',
            })}
          </Menu.Item>
          <Menu.Item className={styles.menuItem} onClick={handleCardAddClick}>
            {t('action.addCard', {
              context: 'title',
            })}
          </Menu.Item>
          {onDelete && (
            <Menu.Item className={styles.menuItem} onClick={handleDeleteClick}>
              {t('action.deleteList', {
                context: 'title',
              })}
            </Menu.Item>
          )}
        </Menu>
      </Popup.Content>
    </>
  );
});

ActionsStep.propTypes = {
  onNameEdit: PropTypes.func.isRequired,
  onCardAdd: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

ActionsStep.defaultProps = {
  onDelete: undefined,
};

export default withPopup(ActionsStep);
