/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Icon, Menu } from 'semantic-ui-react';
import { Popup } from '../../../../lib/custom-ui';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import { useSteps } from '../../../../hooks';
import SelectRoleStep from './SelectRoleStep';
import ConfirmationStep from '../../ConfirmationStep';

import styles from './ActionsStep.module.scss';

const StepTypes = {
  EDIT_ROLE: 'EDIT_ROLE',
  ACTIVATE: 'ACTIVATE',
  DEACTIVATE: 'DEACTIVATE',
  DELETE: 'DELETE',
};

const ActionsStep = React.memo(({ userId, onEdit, onClose }) => {
  const selectUserById = useMemo(() => selectors.makeSelectUserById(), []);

  const activeUsersLimit = useSelector(selectors.selectActiveUsersLimit);
  const activeUsersTotal = useSelector(selectors.selectActiveUsersTotal);
  const user = useSelector((state) => selectUserById(state, userId));
  const isCurrentUser = useSelector((state) => user.id === selectors.selectCurrentUserId(state));

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [step, openStep, handleBack] = useSteps();

  const handleRoleSelect = useCallback(
    (role) => {
      dispatch(
        entryActions.updateUser(userId, {
          role,
        }),
      );
    },
    [userId, dispatch],
  );

  const handleActivateConfirm = useCallback(() => {
    dispatch(
      entryActions.updateUser(userId, {
        isDeactivated: false,
      }),
    );

    onClose();
  }, [userId, onClose, dispatch]);

  const handleDeactivateConfirm = useCallback(() => {
    dispatch(
      entryActions.updateUser(userId, {
        isDeactivated: true,
      }),
    );

    onClose();
  }, [userId, onClose, dispatch]);

  const handleDeleteConfirm = useCallback(() => {
    dispatch(entryActions.deleteUser(userId));
  }, [userId, dispatch]);

  const handleEditClick = useCallback(() => {
    onEdit(userId);
    onClose();
  }, [userId, onEdit, onClose]);

  const handleEditRoleClick = useCallback(() => {
    openStep(StepTypes.EDIT_ROLE);
  }, [openStep]);

  const handleActivateClick = useCallback(() => {
    openStep(StepTypes.ACTIVATE);
  }, [openStep]);

  const handleDeactivateClick = useCallback(() => {
    openStep(StepTypes.DEACTIVATE);
  }, [openStep]);

  const handleDeleteClick = useCallback(() => {
    openStep(StepTypes.DELETE);
  }, [openStep]);

  if (step) {
    switch (step.type) {
      case StepTypes.EDIT_ROLE:
        return (
          <SelectRoleStep
            withButton
            defaultValue={user.role}
            title="common.editRole"
            buttonContent="action.save"
            onSelect={handleRoleSelect}
            onBack={handleBack}
            onClose={onClose}
          />
        );
      case StepTypes.ACTIVATE:
        return (
          <ConfirmationStep
            title="common.activateUser"
            content="common.areYouSureYouWantToActivateThisUser"
            buttonType="positive"
            buttonContent="action.activateUser"
            onConfirm={handleActivateConfirm}
            onBack={handleBack}
          />
        );
      case StepTypes.DEACTIVATE:
        return (
          <ConfirmationStep
            title="common.deactivateUser"
            content="common.areYouSureYouWantToDeactivateThisUser"
            buttonContent="action.deactivateUser"
            onConfirm={handleDeactivateConfirm}
            onBack={handleBack}
          />
        );
      case StepTypes.DELETE:
        return (
          <ConfirmationStep
            title="common.deleteUser"
            content="common.areYouSureYouWantToDeleteThisUser"
            buttonContent="action.deleteUser"
            typeValue={user.name}
            typeContent="common.typeNameToConfirm"
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
        {t('common.userActions', {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Menu secondary vertical className={styles.menu}>
          <Menu.Item className={styles.menuItem} onClick={handleEditClick}>
            <Icon name="info" className={styles.menuItemIcon} />
            {t('action.editInformation', {
              context: 'title',
            })}
          </Menu.Item>
          {!user.lockedFieldNames.includes('role') && !isCurrentUser && (
            <Menu.Item className={styles.menuItem} onClick={handleEditRoleClick}>
              <Icon name="sun outline" className={styles.menuItemIcon} />
              {t('action.editRole', {
                context: 'title',
              })}
            </Menu.Item>
          )}
          {!isCurrentUser && (
            <>
              <Menu.Item
                disabled={
                  user.isDeactivated &&
                  activeUsersLimit !== null &&
                  activeUsersTotal >= activeUsersLimit
                }
                className={styles.menuItem}
                onClick={user.isDeactivated ? handleActivateClick : handleDeactivateClick}
              >
                <Icon
                  name={user.isDeactivated ? 'plus' : 'close'}
                  className={styles.menuItemIcon}
                />
                {user.isDeactivated
                  ? t('action.activateUser', {
                      context: 'title',
                    })
                  : t('action.deactivateUser', {
                      context: 'title',
                    })}
              </Menu.Item>
              {user.isDeactivated && !user.isDefaultAdmin && (
                <Menu.Item className={styles.menuItem} onClick={handleDeleteClick}>
                  <Icon name="trash alternate outline" className={styles.menuItemIcon} />
                  {t('action.deleteUser', {
                    context: 'title',
                  })}
                </Menu.Item>
              )}
            </>
          )}
        </Menu>
      </Popup.Content>
    </>
  );
});

ActionsStep.propTypes = {
  userId: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ActionsStep;
