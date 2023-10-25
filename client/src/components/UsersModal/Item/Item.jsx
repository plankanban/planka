import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Button, Icon, Radio, Table } from 'semantic-ui-react';
import { usePopup } from '../../../lib/popup';

import ActionsStep from './ActionsStep';
import User from '../../User';

import styles from './Item.module.scss';

const Item = React.memo(
  ({
    email,
    username,
    name,
    avatarUrl,
    organization,
    phone,
    isAdmin,
    isLocked,
    isRoleLocked,
    isDeletionLocked,
    emailUpdateForm,
    passwordUpdateForm,
    usernameUpdateForm,
    onUpdate,
    onUsernameUpdate,
    onUsernameUpdateMessageDismiss,
    onEmailUpdate,
    onEmailUpdateMessageDismiss,
    onPasswordUpdate,
    onPasswordUpdateMessageDismiss,
    onDelete,
  }) => {
    const handleIsAdminChange = useCallback(() => {
      onUpdate({
        isAdmin: !isAdmin,
      });
    }, [isAdmin, onUpdate]);

    const ActionsPopup = usePopup(ActionsStep);

    return (
      <Table.Row>
        <Table.Cell>
          <User name={name} avatarUrl={avatarUrl} />
        </Table.Cell>
        <Table.Cell>{name}</Table.Cell>
        <Table.Cell>{username || '-'}</Table.Cell>
        <Table.Cell>{email}</Table.Cell>
        <Table.Cell>
          <Radio toggle checked={isAdmin} disabled={isRoleLocked} onChange={handleIsAdminChange} />
        </Table.Cell>
        <Table.Cell textAlign="right">
          <ActionsPopup
            user={{
              email,
              username,
              name,
              organization,
              phone,
              isAdmin,
              isLocked,
              isDeletionLocked,
              emailUpdateForm,
              passwordUpdateForm,
              usernameUpdateForm,
            }}
            onUpdate={onUpdate}
            onUsernameUpdate={onUsernameUpdate}
            onUsernameUpdateMessageDismiss={onUsernameUpdateMessageDismiss}
            onEmailUpdate={onEmailUpdate}
            onEmailUpdateMessageDismiss={onEmailUpdateMessageDismiss}
            onPasswordUpdate={onPasswordUpdate}
            onPasswordUpdateMessageDismiss={onPasswordUpdateMessageDismiss}
            onDelete={onDelete}
          >
            <Button className={styles.button}>
              <Icon fitted name="pencil" />
            </Button>
          </ActionsPopup>
        </Table.Cell>
      </Table.Row>
    );
  },
);

Item.propTypes = {
  email: PropTypes.string.isRequired,
  username: PropTypes.string,
  name: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string,
  organization: PropTypes.string,
  phone: PropTypes.string,
  isAdmin: PropTypes.bool.isRequired,
  isLocked: PropTypes.bool.isRequired,
  isRoleLocked: PropTypes.bool.isRequired,
  isDeletionLocked: PropTypes.bool.isRequired,
  /* eslint-disable react/forbid-prop-types */
  emailUpdateForm: PropTypes.object.isRequired,
  passwordUpdateForm: PropTypes.object.isRequired,
  usernameUpdateForm: PropTypes.object.isRequired,
  /* eslint-enable react/forbid-prop-types */
  onUpdate: PropTypes.func.isRequired,
  onUsernameUpdate: PropTypes.func.isRequired,
  onUsernameUpdateMessageDismiss: PropTypes.func.isRequired,
  onEmailUpdate: PropTypes.func.isRequired,
  onEmailUpdateMessageDismiss: PropTypes.func.isRequired,
  onPasswordUpdate: PropTypes.func.isRequired,
  onPasswordUpdateMessageDismiss: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

Item.defaultProps = {
  username: undefined,
  avatarUrl: undefined,
  organization: undefined,
  phone: undefined,
};

export default Item;
