/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Icon, Menu } from 'semantic-ui-react';
import { Popup } from '../../../../lib/custom-ui';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import { useSteps } from '../../../../hooks';
import { BoardContexts, BoardMembershipRoles } from '../../../../constants/Enums';
import { BoardContextIcons } from '../../../../constants/Icons';
import ConfirmationStep from '../../../common/ConfirmationStep';
import CustomFieldGroupsStep from '../../../custom-field-groups/CustomFieldGroupsStep';

import styles from './ActionsStep.module.scss';

const StepTypes = {
  CUSTOM_FIELD_GROUPS: 'CUSTOM_FIELD_GROUPS',
  EMPTY_TRASH: 'EMPTY_TRASH',
};

const ActionsStep = React.memo(({ onClose }) => {
  const board = useSelector(selectors.selectCurrentBoard);

  const { withSubscribe, withCustomFieldGroups, withTrashEmptier } = useSelector((state) => {
    const isManager = selectors.selectIsCurrentUserManagerForCurrentProject(state);
    const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);

    let isMember = false;
    let isEditor = false;

    if (boardMembership) {
      isMember = true;
      isEditor = boardMembership.role === BoardMembershipRoles.EDITOR;
    }

    return {
      withSubscribe: isMember, // TODO: rename?
      withCustomFieldGroups: isEditor,
      withTrashEmptier: board.context === BoardContexts.TRASH && (isManager || isEditor),
    };
  }, shallowEqual);

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [step, openStep, handleBack] = useSteps();

  const handleToggleSubscriptionClick = useCallback(() => {
    dispatch(
      entryActions.updateCurrentBoard({
        isSubscribed: !board.isSubscribed,
      }),
    );

    onClose();
  }, [onClose, board.isSubscribed, dispatch]);

  const handleSelectContextClick = useCallback(
    (_, { value: context }) => {
      dispatch(entryActions.updateContextInCurrentBoard(context));
      onClose();
    },
    [onClose, dispatch],
  );

  const handleActivitiesClick = useCallback(() => {
    dispatch(entryActions.openBoardActivitiesModal());
    onClose();
  }, [onClose, dispatch]);

  const handleEmptyTrashConfirm = useCallback(() => {
    dispatch(entryActions.clearTrashListInCurrentBoard());
    onClose();
  }, [onClose, dispatch]);

  const handleCustomFieldsClick = useCallback(() => {
    openStep(StepTypes.CUSTOM_FIELD_GROUPS);
  }, [openStep]);

  const handleEmptyTrashClick = useCallback(() => {
    openStep(StepTypes.EMPTY_TRASH);
  }, [openStep]);

  if (step) {
    switch (step.type) {
      case StepTypes.CUSTOM_FIELD_GROUPS:
        return <CustomFieldGroupsStep onBack={handleBack} onClose={onClose} />;
      case StepTypes.EMPTY_TRASH:
        return (
          <ConfirmationStep
            title="common.emptyTrash"
            content="common.areYouSureYouWantToEmptyTrash"
            buttonContent="action.emptyTrash"
            onConfirm={handleEmptyTrashConfirm}
            onBack={handleBack}
          />
        );
      default:
    }
  }

  return (
    <>
      <Popup.Header>
        {t('common.boardActions', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Menu secondary vertical className={styles.menu}>
          {withSubscribe && (
            <Menu.Item className={styles.menuItem} onClick={handleToggleSubscriptionClick}>
              <Icon
                name={board.isSubscribed ? 'bell slash outline' : 'bell outline'}
                className={styles.menuItemIcon}
              />
              {t(board.isSubscribed ? 'action.unsubscribe' : 'action.subscribe', {
                context: 'title',
              })}
            </Menu.Item>
          )}
          {withCustomFieldGroups && (
            <Menu.Item className={styles.menuItem} onClick={handleCustomFieldsClick}>
              <Icon name="sticky note outline" className={styles.menuItemIcon} />
              {t('common.customFields', {
                context: 'title',
              })}
            </Menu.Item>
          )}
          <Menu.Item className={styles.menuItem} onClick={handleActivitiesClick}>
            <Icon name="list ul" className={styles.menuItemIcon} />
            {t('common.actions', {
              context: 'title',
            })}
          </Menu.Item>
          {withTrashEmptier && (
            <>
              <hr className={styles.divider} />
              <Menu.Item className={styles.menuItem} onClick={handleEmptyTrashClick}>
                <Icon name="trash alternate outline" className={styles.menuItemIcon} />
                {t('action.emptyTrash', {
                  context: 'title',
                })}
              </Menu.Item>
            </>
          )}
          <>
            <hr className={styles.divider} />
            {[BoardContexts.BOARD, BoardContexts.ARCHIVE, BoardContexts.TRASH].map((context) => (
              <Menu.Item
                key={context}
                value={context}
                active={context === board.context}
                className={styles.menuItem}
                onClick={handleSelectContextClick}
              >
                <Icon name={BoardContextIcons[context]} className={styles.menuItemIcon} />
                {t(`common.${context}`)}
              </Menu.Item>
            ))}
          </>
        </Menu>
      </Popup.Content>
    </>
  );
});

ActionsStep.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default ActionsStep;
