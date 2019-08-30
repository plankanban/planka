import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {
  Button, Header, Modal, Table,
} from 'semantic-ui-react';

import AddUserPopupContainer from '../../containers/AddUserPopupContainer';
import Item from './Item';

import styles from './UsersModal.module.css';

const UsersModal = React.memo(({
  items, onUpdate, onDelete, onClose,
}) => {
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
    <Modal open closeIcon size="large" onClose={onClose}>
      <Modal.Content>
        <Header size="huge" className={styles.title}>
          {t('common.users', {
            context: 'title',
          })}
        </Header>
        <Table basic="very">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>{t('common.name')}</Table.HeaderCell>
              <Table.HeaderCell>{t('common.email')}</Table.HeaderCell>
              <Table.HeaderCell>{t('common.administrator')}</Table.HeaderCell>
              <Table.HeaderCell />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {items.map((item) => (
              <Item
                key={item.id}
                name={item.name}
                email={item.email}
                isAdmin={item.isAdmin}
                onUpdate={(data) => handleUpdate(item.id, data)}
                onDelete={() => handleDelete(item.id)}
              />
            ))}
          </Table.Body>
          <Table.Footer>
            <Table.Row>
              <Table.HeaderCell colSpan="4">
                <AddUserPopupContainer>
                  <Button positive content={t('action.addUser')} className={styles.button} />
                </AddUserPopupContainer>
              </Table.HeaderCell>
            </Table.Row>
          </Table.Footer>
        </Table>
      </Modal.Content>
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
