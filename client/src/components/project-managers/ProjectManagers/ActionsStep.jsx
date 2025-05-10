/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button } from 'semantic-ui-react';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useSteps } from '../../../hooks';
import { UserRoles } from '../../../constants/Enums';
import ConfirmationStep from '../../common/ConfirmationStep';
import UserAvatar from '../../users/UserAvatar';

import styles from './ActionsStep.module.scss';

const StepTypes = {
  DELETE: 'DELETE',
  ASSIGN_AS_OWNER: 'ASSIGN_AS_OWNER',
};

const ActionsStep = React.memo(({ projectManagerId, onClose }) => {
  const selectProjectManagerById = useMemo(() => selectors.makeSelectProjectManagerById(), []);
  const selectUserById = useMemo(() => selectors.makeSelectUserById(), []);

  const projectManager = useSelector((state) => selectProjectManagerById(state, projectManagerId));
  const user = useSelector((state) => selectUserById(state, projectManager.userId));

  const isCurrentUser = useSelector(
    (state) => projectManager.userId === selectors.selectCurrentUserId(state),
  );

  const { canDelete, canAssignAsOwner } = useSelector((state) => {
    const currentUser = selectors.selectCurrentUser(state);

    const isLastProjectManager =
      selectors.selectManagerUserIdsForCurrentProject(state).length === 1;

    if (currentUser.role !== UserRoles.ADMIN) {
      return {
        canDelete: !isLastProjectManager,
        canAssignAsOwner: false,
      };
    }

    const isInSharedProject = !selectors.selectCurrentProject(state).ownerProjectManagerId;

    return {
      canDelete: !isLastProjectManager,
      canAssignAsOwner: isLastProjectManager && isInSharedProject,
    };
  }, shallowEqual);

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [step, openStep, handleBack] = useSteps();

  const handleAssignAsOwnerConfirm = useCallback(() => {
    dispatch(
      entryActions.updateCurrentProject({
        ownerProjectManagerId: projectManagerId,
      }),
    );

    onClose();
  }, [projectManagerId, onClose, dispatch]);

  const handleDeleteConfirm = useCallback(() => {
    dispatch(entryActions.deleteProjectManager(projectManagerId));
  }, [projectManagerId, dispatch]);

  const handleAssignAsOwnerClick = useCallback(() => {
    openStep(StepTypes.ASSIGN_AS_OWNER);
  }, [openStep]);

  const handleDeleteClick = useCallback(() => {
    openStep(StepTypes.DELETE);
  }, [openStep]);

  if (step) {
    switch (step.type) {
      case StepTypes.ASSIGN_AS_OWNER:
        return (
          <ConfirmationStep
            title="common.assignAsOwner"
            content="common.areYouSureYouWantToAssignThisProjectManagerAsOwner"
            buttonType="positive"
            buttonContent="action.assignAsOwner"
            onConfirm={handleAssignAsOwnerConfirm}
            onBack={handleBack}
          />
        );
      case StepTypes.DELETE:
        return (
          <ConfirmationStep
            title={isCurrentUser ? 'common.leaveProject' : 'common.removeManager'}
            content={
              isCurrentUser
                ? 'common.areYouSureYouWantToLeaveProject'
                : 'common.areYouSureYouWantToRemoveThisManagerFromProject'
            }
            buttonContent={isCurrentUser ? 'action.leaveProject' : 'action.removeManager'}
            onConfirm={handleDeleteConfirm}
            onBack={handleBack}
          />
        );
      default:
    }
  }

  return (
    <>
      <span className={styles.user}>
        <UserAvatar id={projectManager.userId} size="large" />
      </span>
      <span className={styles.content}>
        <div className={styles.name}>{user.name}</div>
        {user.username && <div className={styles.username}>@{user.username}</div>}
      </span>
      {canAssignAsOwner && (
        <Button
          fluid
          content={t('action.assignAsOwner')}
          className={styles.button}
          onClick={handleAssignAsOwnerClick}
        />
      )}
      {canDelete && (
        <Button
          fluid
          content={isCurrentUser ? t('action.leaveProject') : t('action.removeFromProject')}
          className={styles.button}
          onClick={handleDeleteClick}
        />
      )}
    </>
  );
});

ActionsStep.propTypes = {
  projectManagerId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ActionsStep;
