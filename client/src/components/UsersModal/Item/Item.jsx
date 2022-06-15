import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Button, Icon, Radio, Table } from 'semantic-ui-react';

import ActionsPopup from './ActionsPopup';

import styles from './Item.module.scss';

const Item = React.memo(
  ({
    email,
    username,
    name,
    organization,
    phone,
    isAdmin,
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

    return (
      <Table.Row>
        <Table.Cell>{name}</Table.Cell>
        <Table.Cell>{username || '-'}</Table.Cell>
        <Table.Cell>{email}</Table.Cell>
        <Table.Cell collapsing>
          <Radio toggle checked={isAdmin} onChange={handleIsAdminChange} />
        </Table.Cell>
        <Table.Cell collapsing>
          <ActionsPopup
            user={{
              email,
              username,
              name,
              organization,
              phone,
              isAdmin,
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
  organization: PropTypes.string,
  phone: PropTypes.string,
  isAdmin: PropTypes.bool.isRequired,
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
  organization: undefined,
  phone: undefined,
};

export default Item;
