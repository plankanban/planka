import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation, Trans } from 'react-i18next';
import { Comment } from 'semantic-ui-react';

import getDateFormat from '../../../utils/get-date-format';
import { ActivityTypes } from '../../../constants/Enums';
import ItemComment from './ItemComment';
import User from '../../User';

import styles from './Item.module.scss';

const Item = React.memo(({ type, data, createdAt, user }) => {
  const [t] = useTranslation();

  let contentNode;
  switch (type) {
    case ActivityTypes.CREATE_CARD:
      contentNode = (
        <Trans
          i18nKey="common.userAddedThisCardToList"
          values={{
            user: user.name,
            list: data.list.name,
          }}
        >
          <span className={styles.author}>{user.name}</span>
          <span className={styles.text}>
            {' added this card to '}
            {data.list.name}
          </span>
        </Trans>
      );

      break;
    case ActivityTypes.MOVE_CARD:
      contentNode = (
        <Trans
          i18nKey="common.userMovedThisCardFromListToList"
          values={{
            user: user.name,
            fromList: data.fromList.name,
            toList: data.toList.name,
          }}
        >
          <span className={styles.author}>{user.name}</span>
          <span className={styles.text}>
            {' moved this card from '}
            {data.fromList.name}
            {' to '}
            {data.toList.name}
          </span>
        </Trans>
      );

      break;
    default:
      contentNode = null;
  }

  return (
    <Comment>
      <span className={styles.user}>
        <User name={user.name} avatarUrl={user.avatarUrl} />
      </span>
      <div className={classNames(styles.content)}>
        <div>{contentNode}</div>
        <span className={styles.date}>
          {t(`format:${getDateFormat(createdAt)}`, {
            postProcess: 'formatDate',
            value: createdAt,
          })}
        </span>
      </div>
    </Comment>
  );
});

Item.Comment = ItemComment;

Item.propTypes = {
  type: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  createdAt: PropTypes.instanceOf(Date).isRequired,
  user: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default Item;
