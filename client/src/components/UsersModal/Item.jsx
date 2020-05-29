import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Radio, Table } from 'semantic-ui-react';

import DeletePopup from '../DeletePopup';

import styles from './Item.module.scss';

const Item = React.memo(({ name, username, email, isAdmin, onUpdate, onDelete }) => {
  const [t] = useTranslation();

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
        <DeletePopup
          title={t('common.deleteUser', {
            context: 'title',
          })}
          content={t('common.areYouSureYouWantToDeleteThisUser')}
          buttonContent={t('action.deleteUser')}
          onConfirm={onDelete}
        >
          <Button content={t('action.delete')} className={styles.button} />
        </DeletePopup>
      </Table.Cell>
    </Table.Row>
  );
});

Item.propTypes = {
  name: PropTypes.string.isRequired,
  username: PropTypes.string,
  email: PropTypes.string.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

Item.defaultProps = {
  username: undefined,
};

export default Item;
