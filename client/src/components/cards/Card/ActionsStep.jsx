/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Icon, Menu } from 'semantic-ui-react';
import { Popup } from '../../../lib/custom-ui';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useSteps } from '../../../hooks';
import { isListArchiveOrTrash } from '../../../utils/record-helpers';
import { BoardMembershipRoles, CardTypes, ListTypes } from '../../../constants/Enums';
import SelectCardTypeStep from '../SelectCardTypeStep';
import EditDueDateStep from '../EditDueDateStep';
import EditStopwatchStep from '../EditStopwatchStep';
import MoveCardStep from '../MoveCardStep';
import ConfirmationStep from '../../common/ConfirmationStep';
import BoardMembershipsStep from '../../board-memberships/BoardMembershipsStep';
import LabelsStep from '../../labels/LabelsStep';

import styles from './ActionsStep.module.scss';

const StepTypes = {
  EDIT_TYPE: 'EDIT_TYPE',
  USERS: 'USERS',
  LABELS: 'LABELS',
  EDIT_DUE_DATE: 'EDIT_DUE_DATE',
  EDIT_STOPWATCH: 'EDIT_STOPWATCH',
  MOVE: 'MOVE',
  ARCHIVE: 'ARCHIVE',
  DELETE: 'DELETE',
};

const ActionsStep = React.memo(({ cardId, onNameEdit, onClose }) => {
  const selectCardById = useMemo(() => selectors.makeSelectCardById(), []);
  const selectListById = useMemo(() => selectors.makeSelectListById(), []);
  const selectPrevListById = useMemo(() => selectors.makeSelectListById(), []);
  const selectUserIdsByCardId = useMemo(() => selectors.makeSelectUserIdsByCardId(), []);
  const selectLabelIdsByCardId = useMemo(() => selectors.makeSelectLabelIdsByCardId(), []);

  const board = useSelector(selectors.selectCurrentBoard);
  const card = useSelector((state) => selectCardById(state, cardId));
  const list = useSelector((state) => selectListById(state, card.listId));

  // TODO: check availability?
  const prevList = useSelector(
    (state) => card.prevListId && selectPrevListById(state, card.prevListId),
  );

  const userIds = useSelector((state) => selectUserIdsByCardId(state, cardId));
  const labelIds = useSelector((state) => selectLabelIdsByCardId(state, cardId));

  const {
    canEditType,
    canEditName,
    canEditDueDate,
    canEditStopwatch,
    canDuplicate,
    canMove,
    canRestore,
    canArchive,
    canDelete,
    canUseMembers,
    canUseLabels,
  } = useSelector((state) => {
    const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
    const isEditor = !!boardMembership && boardMembership.role === BoardMembershipRoles.EDITOR;

    if (isListArchiveOrTrash(list)) {
      return {
        canEditType: false,
        canEditName: false,
        canEditDueDate: false,
        canEditStopwatch: false,
        canDuplicate: false,
        canMove: false,
        canRestore: isEditor,
        canArchive: isEditor,
        canDelete: isEditor,
        canUseMembers: false,
        canUseLabels: false,
      };
    }

    return {
      canEditType: isEditor,
      canEditName: isEditor,
      canEditDueDate: isEditor,
      canEditStopwatch: isEditor,
      canDuplicate: isEditor,
      canMove: isEditor,
      canRestore: null,
      canArchive: isEditor,
      canDelete: isEditor,
      canUseMembers: isEditor,
      canUseLabels: isEditor,
    };
  }, shallowEqual);

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [step, openStep, handleBack] = useSteps();

  const handleTypeSelect = useCallback(
    (type) => {
      dispatch(
        entryActions.updateCard(cardId, {
          type,
        }),
      );
    },
    [cardId, dispatch],
  );

  const handleDuplicateClick = useCallback(() => {
    dispatch(
      entryActions.duplicateCard(cardId, {
        name: `${card.name} (${t('common.copy', {
          context: 'inline',
        })})`,
      }),
    );

    onClose();
  }, [cardId, onClose, card.name, dispatch, t]);

  const handleRestoreClick = useCallback(() => {
    dispatch(entryActions.moveCard(cardId, card.prevListId, undefined, true));
  }, [cardId, card.prevListId, dispatch]);

  const handleArchiveConfirm = useCallback(() => {
    dispatch(entryActions.moveCardToArchive(cardId));
  }, [cardId, dispatch]);

  const isInTrashList = list.type === ListTypes.TRASH;

  const handleDeleteConfirm = useCallback(() => {
    if (isInTrashList) {
      dispatch(entryActions.deleteCard(cardId));
    } else {
      dispatch(entryActions.moveCardToTrash(cardId));
    }
  }, [cardId, isInTrashList, dispatch]);

  const handleUserSelect = useCallback(
    (userId) => {
      dispatch(entryActions.addUserToCard(userId, cardId));
    },
    [cardId, dispatch],
  );

  const handleUserDeselect = useCallback(
    (userId) => {
      dispatch(entryActions.removeUserFromCard(userId, cardId));
    },
    [cardId, dispatch],
  );

  const handleLabelSelect = useCallback(
    (labelId) => {
      dispatch(entryActions.addLabelToCard(labelId, cardId));
    },
    [cardId, dispatch],
  );

  const handleLabelDeselect = useCallback(
    (labelId) => {
      dispatch(entryActions.removeLabelFromCard(labelId, cardId));
    },
    [cardId, dispatch],
  );

  const handleEditNameClick = useCallback(() => {
    onNameEdit();
    onClose();
  }, [onNameEdit, onClose]);

  const handleEditTypeClick = useCallback(() => {
    openStep(StepTypes.EDIT_TYPE);
  }, [openStep]);

  const handleUsersClick = useCallback(() => {
    openStep(StepTypes.USERS);
  }, [openStep]);

  const handleLabelsClick = useCallback(() => {
    openStep(StepTypes.LABELS);
  }, [openStep]);

  const handleEditDueDateClick = useCallback(() => {
    openStep(StepTypes.EDIT_DUE_DATE);
  }, [openStep]);

  const handleEditStopwatchClick = useCallback(() => {
    openStep(StepTypes.EDIT_STOPWATCH);
  }, [openStep]);

  const handleMoveClick = useCallback(() => {
    openStep(StepTypes.MOVE);
  }, [openStep]);

  const handleArchiveClick = useCallback(() => {
    openStep(StepTypes.ARCHIVE);
  }, [openStep]);

  const handleDeleteClick = useCallback(() => {
    openStep(StepTypes.DELETE);
  }, [openStep]);

  if (step) {
    switch (step.type) {
      case StepTypes.EDIT_TYPE:
        return (
          <SelectCardTypeStep
            withButton
            defaultValue={card.type}
            title="common.editType"
            buttonContent="action.save"
            onSelect={handleTypeSelect}
            onBack={handleBack}
            onClose={onClose}
          />
        );
      case StepTypes.USERS:
        return (
          <BoardMembershipsStep
            currentUserIds={userIds}
            onUserSelect={handleUserSelect}
            onUserDeselect={handleUserDeselect}
            onBack={handleBack}
          />
        );
      case StepTypes.LABELS:
        return (
          <LabelsStep
            currentIds={labelIds}
            cardId={cardId}
            onSelect={handleLabelSelect}
            onDeselect={handleLabelDeselect}
            onBack={handleBack}
          />
        );
      case StepTypes.EDIT_DUE_DATE:
        return <EditDueDateStep cardId={cardId} onBack={handleBack} onClose={onClose} />;
      case StepTypes.EDIT_STOPWATCH:
        return <EditStopwatchStep cardId={cardId} onBack={handleBack} onClose={onClose} />;
      case StepTypes.MOVE:
        return <MoveCardStep id={cardId} onBack={handleBack} onClose={onClose} />;
      case StepTypes.ARCHIVE:
        return (
          <ConfirmationStep
            title="common.archiveCard"
            content="common.areYouSureYouWantToArchiveThisCard"
            buttonContent="action.archiveCard"
            onConfirm={handleArchiveConfirm}
            onBack={handleBack}
          />
        );
      case StepTypes.DELETE:
        return (
          <ConfirmationStep
            title={isInTrashList ? 'common.deleteCardForever' : 'common.deleteCard'}
            content={
              isInTrashList
                ? 'common.areYouSureYouWantToDeleteThisCardForever'
                : 'common.areYouSureYouWantToDeleteThisCard'
            }
            buttonContent={isInTrashList ? 'action.deleteCardForever' : 'action.deleteCard'}
            onConfirm={handleDeleteConfirm}
            onBack={handleBack}
          />
        );
      default:
    }
  }

  return (
    <>
      <Popup.Header>
        {t('common.cardActions', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Menu secondary vertical className={styles.menu}>
          {canEditName && (
            <Menu.Item className={styles.menuItem} onClick={handleEditNameClick}>
              <Icon name="edit outline" className={styles.menuItemIcon} />
              {t('action.editTitle', {
                context: 'title',
              })}
            </Menu.Item>
          )}
          {!board.limitCardTypesToDefaultOne && canEditType && (
            <Menu.Item className={styles.menuItem} onClick={handleEditTypeClick}>
              <Icon name="map outline" className={styles.menuItemIcon} />
              {t('action.editType', {
                context: 'title',
              })}
            </Menu.Item>
          )}
          {card.type === CardTypes.PROJECT && canUseMembers && (
            <Menu.Item className={styles.menuItem} onClick={handleUsersClick}>
              <Icon name="user outline" className={styles.menuItemIcon} />
              {t('common.members', {
                context: 'title',
              })}
            </Menu.Item>
          )}
          {canUseLabels && (
            <Menu.Item className={styles.menuItem} onClick={handleLabelsClick}>
              <Icon name="bookmark outline" className={styles.menuItemIcon} />
              {t('common.labels', {
                context: 'title',
              })}
            </Menu.Item>
          )}
          {card.type === CardTypes.STORY && canUseMembers && (
            <Menu.Item className={styles.menuItem} onClick={handleUsersClick}>
              <Icon name="user outline" className={styles.menuItemIcon} />
              {t('common.members', {
                context: 'title',
              })}
            </Menu.Item>
          )}
          {card.type === CardTypes.PROJECT && canEditDueDate && (
            <Menu.Item className={styles.menuItem} onClick={handleEditDueDateClick}>
              <Icon name="calendar check outline" className={styles.menuItemIcon} />
              {t('action.editDueDate', {
                context: 'title',
              })}
            </Menu.Item>
          )}
          {card.type === CardTypes.PROJECT && canEditStopwatch && (
            <Menu.Item className={styles.menuItem} onClick={handleEditStopwatchClick}>
              <Icon name="clock outline" className={styles.menuItemIcon} />
              {t('action.editStopwatch', {
                context: 'title',
              })}
            </Menu.Item>
          )}
          {canDuplicate && (
            <Menu.Item className={styles.menuItem} onClick={handleDuplicateClick}>
              <Icon name="copy outline" className={styles.menuItemIcon} />
              {t('action.duplicateCard', {
                context: 'title',
              })}
            </Menu.Item>
          )}
          {canMove && (
            <Menu.Item className={styles.menuItem} onClick={handleMoveClick}>
              <Icon name="share square outline" className={styles.menuItemIcon} />
              {t('action.moveCard', {
                context: 'title',
              })}
            </Menu.Item>
          )}
          {prevList && canRestore && (
            <Menu.Item className={styles.menuItem} onClick={handleRestoreClick}>
              <Icon name="undo alternate" className={styles.menuItemIcon} />
              {t('action.restoreToList', {
                context: 'title',
                list: prevList.name || t(`common.${prevList.type}`),
              })}
            </Menu.Item>
          )}
          {list.type !== ListTypes.ARCHIVE && canArchive && (
            <Menu.Item className={styles.menuItem} onClick={handleArchiveClick}>
              <Icon name="folder open outline" className={styles.menuItemIcon} />
              {t('action.archiveCard', {
                context: 'title',
              })}
            </Menu.Item>
          )}
          {canDelete && (
            <Menu.Item className={styles.menuItem} onClick={handleDeleteClick}>
              <Icon name="trash alternate outline" className={styles.menuItemIcon} />
              {isInTrashList
                ? t('action.deleteForever', {
                    context: 'title',
                  })
                : t('action.deleteCard', {
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
  cardId: PropTypes.string.isRequired,
  onNameEdit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ActionsStep;
