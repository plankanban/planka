import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Modal, Table } from 'semantic-ui-react';

import UserAddPopupContainer from '../../containers/UserAddPopupContainer';
import Item from './Item';

const UsersModal = React.memo(({ items, onUpdate, onDelete, onClose }) => {
  const [t] = useTranslation();

  const handleUpdate = useCallback(
    (id, data) => {
      onUpdate(id, data);
    },
    [onUpdate],
  );

  const handleDelete = useCallback(
    (id) => {
      onDelete(id);
    },
    [onDelete],
  );

  return (
    <Modal open closeIcon size="large" centered={false} onClose={onClose}>
      <Modal.Header>
        {t('common.users', {
          context: 'title',
        })}
      </Modal.Header>
      <Modal.Content>
        <Table basic="very">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell width={4}>{t('common.name')}</Table.HeaderCell>
              <Table.HeaderCell width={4}>{t('common.username')}</Table.HeaderCell>
              <Table.HeaderCell width={4}>{t('common.email')}</Table.HeaderCell>
              <Table.HeaderCell>{t('common.administrator')}</Table.HeaderCell>
              <Table.HeaderCell />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {items.map((item) => (
              <Item
                key={item.id}
                name={item.name}
                username={item.username}
                email={item.email}
                isAdmin={item.isAdmin}
                onUpdate={(data) => handleUpdate(item.id, data)}
                onDelete={() => handleDelete(item.id)}
              />
            ))}
          </Table.Body>
        </Table>
      </Modal.Content>
      <Modal.Actions>
        <UserAddPopupContainer>
          <Button positive content={t('action.addUser')} />
        </UserAddPopupContainer>
      </Modal.Actions>
    </Modal>
  );
});

UsersModal.propTypes = {
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default UsersModal;
