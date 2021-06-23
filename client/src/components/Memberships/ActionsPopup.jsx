import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button } from 'semantic-ui-react';
import { withPopup } from '../../lib/popup';

import { useSteps } from '../../hooks';
import User from '../User';
import DeleteStep from '../DeleteStep';

import styles from './ActionsPopup.module.scss';

const StepTypes = {
  DELETE: 'DELETE',
};

const ActionsStep = React.memo(
  ({
    user,
    leaveButtonContent,
    leaveConfirmationTitle,
    leaveConfirmationContent,
    leaveConfirmationButtonContent,
    deleteButtonContent,
    deleteConfirmationTitle,
    deleteConfirmationContent,
    deleteConfirmationButtonContent,
    canLeave,
    canDelete,
    onDelete,
  }) => {
    const [t] = useTranslation();
    const [step, openStep, handleBack] = useSteps();

    const handleDeleteClick = useCallback(() => {
      openStep(StepTypes.DELETE);
    }, [openStep]);

    if (step && step.type === StepTypes.DELETE) {
      return (
        <DeleteStep
          title={t(user.isCurrent ? leaveConfirmationTitle : deleteConfirmationTitle, {
            context: 'title',
          })}
          content={t(user.isCurrent ? leaveConfirmationContent : deleteConfirmationContent)}
          buttonContent={t(
            user.isCurrent ? leaveConfirmationButtonContent : deleteConfirmationButtonContent,
          )}
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
          {user.isCurrent
            ? canLeave && (
                <Button
                  content={t(leaveButtonContent)}
                  className={styles.deleteButton}
                  onClick={handleDeleteClick}
                />
              )
            : canDelete && (
                <Button
                  content={t(deleteButtonContent)}
                  className={styles.deleteButton}
                  onClick={handleDeleteClick}
                />
              )}
        </span>
      </>
    );
  },
);

ActionsStep.propTypes = {
  user: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  leaveButtonContent: PropTypes.string,
  leaveConfirmationTitle: PropTypes.string,
  leaveConfirmationContent: PropTypes.string,
  leaveConfirmationButtonContent: PropTypes.string,
  deleteButtonContent: PropTypes.string,
  deleteConfirmationTitle: PropTypes.string,
  deleteConfirmationContent: PropTypes.string,
  deleteConfirmationButtonContent: PropTypes.string,
  canLeave: PropTypes.bool.isRequired,
  canDelete: PropTypes.bool.isRequired,
  onDelete: PropTypes.func.isRequired,
};

ActionsStep.defaultProps = {
  leaveButtonContent: 'action.leaveBoard',
  leaveConfirmationTitle: 'common.leaveBoard',
  leaveConfirmationContent: 'common.areYouSureYouWantToLeaveBoard',
  leaveConfirmationButtonContent: 'action.leaveBoard',
  deleteButtonContent: 'action.removeFromBoard',
  deleteConfirmationTitle: 'common.removeMember',
  deleteConfirmationContent: 'common.areYouSureYouWantToRemoveThisMemberFromBoard',
  deleteConfirmationButtonContent: 'action.removeMember',
};

export default withPopup(ActionsStep);
