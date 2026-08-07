/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Modal, Tab } from 'semantic-ui-react';

import selectors from '../../../../selectors';
import ProfilePane from './ProfilePane';
import ApiKeyPane from './ApiKeyPane';

import styles from './UserEditModal.module.scss';

const UserEditModal = React.memo(({ userId, onClose }) => {
  const selectUserById = useMemo(() => selectors.makeSelectUserById(), []);
  const user = useSelector((state) => selectUserById(state, userId));

  const [t] = useTranslation();

  const panes = [
    {
      menuItem: t('common.information'),
      render: () => <ProfilePane userId={userId} />,
    },
    {
      menuItem: t('common.apiKey', {
        context: 'title',
      }),
      render: () => <ApiKeyPane userId={userId} onClose={onClose} />,
    },
  ];

  return (
    <Modal
      open
      closeIcon
      size="small"
      centered={false}
      className={styles.wrapper}
      onClose={onClose}
    >
      <Modal.Header className={styles.header}>{user.name}</Modal.Header>
      <Modal.Content>
        <Tab
          menu={{
            secondary: true,
            pointing: true,
          }}
          panes={panes}
        />
      </Modal.Content>
    </Modal>
  );
});

UserEditModal.propTypes = {
  userId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default UserEditModal;
