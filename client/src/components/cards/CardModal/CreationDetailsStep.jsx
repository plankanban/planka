/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Icon } from 'semantic-ui-react';

import selectors from '../../../selectors';
import { StaticUserIds } from '../../../constants/StaticUsers';
import TimeAgo from '../../common/TimeAgo';
import UserAvatar from '../../users/UserAvatar';

import styles from './CreationDetailsStep.module.scss';

const CreationDetailsStep = React.memo(({ userId }) => {
  const selectUserById = useMemo(() => selectors.makeSelectUserById(), []);

  const card = useSelector(selectors.selectCurrentCard);
  const user = useSelector((state) => selectUserById(state, userId));

  const [t] = useTranslation();

  return (
    <>
      <div className={styles.userWrapper}>
        <span className={styles.user}>
          <UserAvatar id={userId} size="large" />
        </span>
        <span className={styles.content}>
          <div className={styles.name}>
            {user.id === StaticUserIds.DELETED
              ? t(`common.${user.name}`, {
                  context: 'title',
                })
              : user.name}
          </div>
          {user && user.username && <div className={styles.username}>@{user.username}</div>}
        </span>
      </div>
      <div className={styles.information}>
        <Icon name="clock" className={styles.informationIcon} />
        <TimeAgo date={card.createdAt} />
      </div>
    </>
  );
});

CreationDetailsStep.propTypes = {
  userId: PropTypes.string,
};

CreationDetailsStep.defaultProps = {
  userId: undefined,
};

export default CreationDetailsStep;
