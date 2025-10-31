/*!
 * Copyright (c) 2025 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Icon, Table } from 'semantic-ui-react';

import selectors from '../../../../selectors';
import { usePopupInClosableContext } from '../../../../hooks';
import ActionsStep from './ActionsStep';
import UserAvatar from '../../../users/UserAvatar';

import styles from './Item.module.scss';

const Item = React.memo(({ id }) => {
  const selectUserById = useMemo(() => selectors.makeSelectUserById(), []);

  const user = useSelector((state) => selectUserById(state, id));

  const [t] = useTranslation();

  const ActionsPopup = usePopupInClosableContext(ActionsStep);

  const apiKeyStatus = useMemo(() => {
    if (!user.apiKeyPrefix) {
      return null;
    }
    const prefix = user.apiKeyPrefix;
    if (prefix.length <= 12) {
      return prefix;
    }
    return `${prefix.slice(0, 8)}...${prefix.slice(-4)}`;
  }, [user.apiKeyPrefix]);

  return (
    <Table.Row>
      <Table.Cell>
        <UserAvatar id={id} />
      </Table.Cell>
      <Table.Cell>{user.name}</Table.Cell>
      <Table.Cell>{user.username || '-'}</Table.Cell>
      <Table.Cell>{user.email}</Table.Cell>
      <Table.Cell className={styles.statusCell}>
        {apiKeyStatus ? (
          <span className={styles.hasKey}>{apiKeyStatus}</span>
        ) : (
          <span className={styles.noKey}>{t('common.noApiKey')}</span>
        )}
      </Table.Cell>
      <Table.Cell textAlign="right">
        <ActionsPopup userId={id}>
          <Button className={styles.button}>
            <Icon fitted name="pencil" />
          </Button>
        </ActionsPopup>
      </Table.Cell>
    </Table.Row>
  );
});

Item.propTypes = {
  id: PropTypes.string.isRequired,
};

export default Item;
