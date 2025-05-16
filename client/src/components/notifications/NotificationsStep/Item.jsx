/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import truncate from 'lodash/truncate';
import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation, Trans } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from 'semantic-ui-react';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import Paths from '../../../constants/Paths';
import { StaticUserIds } from '../../../constants/StaticUsers';
import { NotificationTypes } from '../../../constants/Enums';
import UserAvatar from '../../users/UserAvatar';

import styles from './Item.module.scss';

const Item = React.memo(({ id, onClose }) => {
  const selectNotificationById = useMemo(() => selectors.makeSelectNotificationById(), []);
  const selectCreatorUserById = useMemo(() => selectors.makeSelectUserById(), []);
  const selectCardById = useMemo(() => selectors.makeSelectCardById(), []);

  const notification = useSelector((state) => selectNotificationById(state, id));

  const creatorUser = useSelector((state) =>
    selectCreatorUserById(state, notification.creatorUserId),
  );

  const card = useSelector((state) => selectCardById(state, notification.cardId));

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const handleDeleteClick = useCallback(() => {
    dispatch(entryActions.deleteNotification(id));
  }, [id, dispatch]);

  const creatorUserName =
    creatorUser.id === StaticUserIds.DELETED
      ? t(`common.${creatorUser.name}`, {
          context: 'title',
        })
      : creatorUser.name;

  const cardName = card ? card.name : notification.data.card.name;

  let contentNode;
  switch (notification.type) {
    case NotificationTypes.MOVE_CARD: {
      const { fromList, toList } = notification.data;

      const fromListName = fromList.name || t(`common.${fromList.type}`);
      const toListName = toList.name || t(`common.${toList.type}`);

      contentNode = (
        <Trans
          i18nKey="common.userMovedCardFromListToList"
          values={{
            user: creatorUserName,
            card: cardName,
            fromList: fromListName,
            toList: toListName,
          }}
        >
          {creatorUserName}
          {' moved '}
          <Link to={Paths.CARDS.replace(':id', notification.cardId)} onClick={onClose}>
            {cardName}
          </Link>
          {' from '}
          {fromListName}
          {' to '}
          {toListName}
        </Trans>
      );

      break;
    }
    case NotificationTypes.COMMENT_CARD: {
      const commentText = truncate(notification.data.text);

      contentNode = (
        <Trans
          i18nKey="common.userLeftNewCommentToCard"
          values={{
            user: creatorUserName,
            comment: commentText,
            card: cardName,
          }}
        >
          {creatorUserName}
          {` left a new comment «${commentText}» to `}
          <Link to={Paths.CARDS.replace(':id', notification.cardId)} onClick={onClose}>
            {cardName}
          </Link>
        </Trans>
      );

      break;
    }
    case NotificationTypes.ADD_MEMBER_TO_CARD:
      contentNode = (
        <Trans
          i18nKey="common.userAddedYouToCard"
          values={{
            user: creatorUserName,
            card: cardName,
          }}
        >
          {creatorUserName}
          {` added you to `}
          <Link to={Paths.CARDS.replace(':id', notification.cardId)} onClick={onClose}>
            {cardName}
          </Link>
        </Trans>
      );

      break;
    default:
      contentNode = null;
  }

  return (
    <div className={styles.wrapper}>
      <UserAvatar id={notification.creatorUserId} size="large" />
      <span className={styles.content}>{contentNode}</span>
      <Button
        type="button"
        icon="trash alternate outline"
        className={styles.button}
        onClick={handleDeleteClick}
      />
    </div>
  );
});

Item.propTypes = {
  id: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Item;
