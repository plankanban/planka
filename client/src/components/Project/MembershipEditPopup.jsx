import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button } from 'semantic-ui-react';
import { withPopup } from '../../lib/popup';

import { useSteps } from '../../hooks';
import User from '../User';
import DeleteStep from '../DeleteStep';

import styles from './MembershipEditPopup.module.scss';

const StepTypes = {
  DELETE: 'DELETE',
};

const MembershipEditStep = React.memo(({ user, isEditable, onDelete }) => {
  const [t] = useTranslation();
  const [step, openStep, handleBack] = useSteps();

  const handleDeleteClick = useCallback(() => {
    openStep(StepTypes.DELETE);
  }, [openStep]);

  if (step && step.type === StepTypes.DELETE) {
    return (
      <DeleteStep
        title={t('common.removeMember', {
          context: 'title',
        })}
        content={t('common.areYouSureYouWantToRemoveThisMemberFromProject')}
        buttonContent={t('action.removeMember')}
        onConfirm={onDelete}
        onBack={handleBack}
      />
    );
  }

  return (
    <>
      <span className={styles.user}>
        <User name={user.name} avatarUrl={user.avatarUrl} size="large" />
      </span>
      <span className={styles.content}>
        <div className={styles.name}>{user.name}</div>
        <div className={styles.email}>{user.email}</div>
        {!user.isCurrent && isEditable && (
          <Button
            content={t('action.removeFromProject')}
            className={styles.deleteButton}
            onClick={handleDeleteClick}
          />
        )}
      </span>
    </>
  );
});

MembershipEditStep.propTypes = {
  user: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isEditable: PropTypes.bool.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default withPopup(MembershipEditStep);
