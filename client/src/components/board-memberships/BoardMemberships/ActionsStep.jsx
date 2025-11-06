/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Icon } from 'semantic-ui-react';
import { Popup } from '../../../lib/custom-ui';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useSteps } from '../../../hooks';
import SelectPermissionsStep from './SelectPermissionsStep';
import ConfirmationStep from '../../common/ConfirmationStep';
import UserAvatar from '../../users/UserAvatar';

import styles from './ActionsStep.module.scss';

const StepTypes = {
  EDIT_PERMISSIONS: 'EDIT_PERMISSIONS',
  DELETE: 'DELETE',
};

const ActionsStep = React.memo(({ boardMembershipId, title, onBack, onClose }) => {
  const selectBoardMembershipById = useMemo(() => selectors.makeSelectBoardMembershipById(), []);
  const selectUserById = useMemo(() => selectors.makeSelectUserById(), []);

  const boardMembership = useSelector((state) =>
    selectBoardMembershipById(state, boardMembershipId),
  );

  const user = useSelector((state) => selectUserById(state, boardMembership.userId));

  const isCurrentUser = useSelector(
    (state) => boardMembership.userId === selectors.selectCurrentUserId(state),
  );

  const canEdit = useSelector(selectors.selectIsCurrentUserManagerForCurrentProject);

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [step, openStep, handleBack] = useSteps();

  const handleRoleSelect = useCallback(
    (data) => {
      dispatch(entryActions.updateBoardMembership(boardMembershipId, data));
    },
    [boardMembershipId, dispatch],
  );

  const handleDeleteConfirm = useCallback(() => {
    dispatch(entryActions.deleteBoardMembership(boardMembershipId));
    onClose();
  }, [boardMembershipId, onClose, dispatch]);

  const handleFilterClick = useCallback(() => {
    dispatch(entryActions.addUserToFilterInCurrentBoard(boardMembership.userId, true));
    onClose();
  }, [onClose, boardMembership.userId, dispatch]);

  const handleEditPermissionsClick = useCallback(() => {
    openStep(StepTypes.EDIT_PERMISSIONS);
  }, [openStep]);

  const handleDeleteClick = useCallback(() => {
    openStep(StepTypes.DELETE);
  }, [openStep]);

  if (step) {
    switch (step.type) {
      case StepTypes.EDIT_PERMISSIONS:
        return (
          <SelectPermissionsStep
            boardMembership={boardMembership}
            title="common.editPermissions"
            buttonContent="action.save"
            onSelect={handleRoleSelect}
            onBack={handleBack}
            onClose={onClose}
          />
        );
      case StepTypes.DELETE:
        return (
          <ConfirmationStep
            title={isCurrentUser ? `common.leaveBoard` : 'common.removeMember'}
            content={
              isCurrentUser
                ? `common.areYouSureYouWantToLeaveBoard`
                : `common.areYouSureYouWantToRemoveThisMemberFromBoard`
            }
            buttonContent={isCurrentUser ? `action.leaveBoard` : 'action.removeMember'}
            onConfirm={handleDeleteConfirm}
            onBack={handleBack}
          />
        );
      default:
    }

    openStep(null);
  }

  const contentNode = (
    <>
      <div className={styles.userWrapper}>
        <span className={styles.user}>
          <UserAvatar id={boardMembership.userId} size="large" />
        </span>
        <span className={styles.content}>
          <div className={styles.name}>{user.name}</div>
          {user.username && <div className={styles.username}>@{user.username}</div>}
        </span>
      </div>
      {user.phone && (
        <div className={styles.information}>
          <Icon name="phone" className={styles.informationIcon} />
          {user.phone}
        </div>
      )}
      {user.organization && (
        <div className={styles.information}>
          <Icon name="building" className={styles.informationIcon} />
          {user.organization}
        </div>
      )}
      <Button
        basic
        content={t('action.showCardsWithThisUser')}
        icon="filter"
        size="tiny"
        onClick={handleFilterClick}
      />
      {(isCurrentUser || canEdit) && (
        <>
          <hr className={styles.divider} />
          {canEdit && (
            <Button
              fluid
              content={t('action.editPermissions')}
              className={styles.button}
              onClick={handleEditPermissionsClick}
            />
          )}
          {isCurrentUser ? (
            <Button
              fluid
              content={t(`action.leaveBoard`)}
              className={styles.button}
              onClick={handleDeleteClick}
            />
          ) : (
            <Button
              fluid
              content={t(`action.removeFromBoard`)}
              className={styles.button}
              onClick={handleDeleteClick}
            />
          )}
        </>
      )}
    </>
  );

  return onBack ? (
    <>
      <Popup.Header onBack={onBack}>
        {t(title, {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>{contentNode}</Popup.Content>
    </>
  ) : (
    contentNode
  );
});

ActionsStep.propTypes = {
  boardMembershipId: PropTypes.string.isRequired,
  title: PropTypes.string,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

ActionsStep.defaultProps = {
  title: 'common.memberActions',
  onBack: undefined,
};

export default ActionsStep;
