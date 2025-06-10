/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { Icon } from 'semantic-ui-react';

import selectors from '../../../selectors';
import markdownToText from '../../../utils/markdown-to-text';
import { BoardViews, ListTypes } from '../../../constants/Enums';
import UserAvatar from '../../users/UserAvatar';
import LabelChip from '../../labels/LabelChip';

import styles from './InlineContent.module.scss';

const InlineContent = React.memo(({ cardId }) => {
  const selectCardById = useMemo(() => selectors.makeSelectCardById(), []);
  const selectListById = useMemo(() => selectors.makeSelectListById(), []);
  const selectLabelIdsByCardId = useMemo(() => selectors.makeSelectLabelIdsByCardId(), []);

  const selectNotificationsTotalByCardId = useMemo(
    () => selectors.makeSelectNotificationsTotalByCardId(),
    [],
  );

  const card = useSelector((state) => selectCardById(state, cardId));
  const list = useSelector((state) => selectListById(state, card.listId));
  const labelIds = useSelector((state) => selectLabelIdsByCardId(state, cardId));

  const notificationsTotal = useSelector((state) =>
    selectNotificationsTotalByCardId(state, cardId),
  );

  const listName = useSelector((state) => {
    if (!list.name) {
      return null;
    }

    const { view } = selectors.selectCurrentBoard(state);

    if (view === BoardViews.KANBAN) {
      return null;
    }

    return list.name;
  });

  const descriptionText = useMemo(
    () => card.description && markdownToText(card.description),
    [card.description],
  );

  const isInClosedList = list.type === ListTypes.CLOSED;

  return (
    <div className={styles.wrapper}>
      <span className={styles.attachments}>
        <UserAvatar withCreatorIndicator id={card.creatorUserId} />
      </span>
      {(notificationsTotal > 0 || listName) && (
        <span className={styles.attachments}>
          {notificationsTotal > 0 && (
            <span
              className={classNames(styles.attachment, styles.attachmentLeft, styles.notification)}
            >
              {notificationsTotal}
            </span>
          )}
          {listName && (
            <span className={classNames(styles.attachment, styles.attachmentLeft)}>
              <span className={styles.attachmentContent}>
                <Icon name="columns" />
                {listName}
              </span>
            </span>
          )}
        </span>
      )}
      {labelIds.length > 0 && (
        <span className={classNames(styles.attachments, styles.hidable)}>
          {labelIds.map((labelId) => (
            <span key={labelId} className={classNames(styles.attachment, styles.attachmentLeft)}>
              <LabelChip id={labelId} size="tiny" />
            </span>
          ))}
        </span>
      )}
      <span
        className={classNames(styles.attachments, styles.name, isInClosedList && styles.nameClosed)}
      >
        <div className={styles.hidable}>{card.name}</div>
      </span>
      {descriptionText && (
        <span className={classNames(styles.attachments, styles.descriptionText, styles.hidable)}>
          {descriptionText}
        </span>
      )}
    </div>
  );
});

InlineContent.propTypes = {
  cardId: PropTypes.string.isRequired,
};

export default InlineContent;
