/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Icon, Table } from 'semantic-ui-react';

import selectors from '../../../../selectors';
import { usePopupInClosableContext } from '../../../../hooks';
import { UserRoleIcons } from '../../../../constants/Icons';
import ActionsStep from './ActionsStep';
import UserAvatar from '../../../users/UserAvatar';

import styles from './Item.module.scss';

const Item = React.memo(({ id }) => {
  const selectUserById = useMemo(() => selectors.makeSelectUserById(), []);

  const user = useSelector((state) => selectUserById(state, id));

  const [t] = useTranslation();

  const ActionsPopup = usePopupInClosableContext(ActionsStep);

  return (
    <Table.Row className={classNames(user.isDeactivated && styles.wrapperDeactivated)}>
      <Table.Cell>
        <UserAvatar id={id} />
      </Table.Cell>
      <Table.Cell>{user.name}</Table.Cell>
      <Table.Cell>{user.username || '-'}</Table.Cell>
      <Table.Cell>{user.email}</Table.Cell>
      <Table.Cell className={styles.roleCell}>
        <Icon name={UserRoleIcons[user.role]} className={styles.roleIcon} />
        {t(`common.${user.role}`)}
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
