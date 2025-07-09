/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Icon } from 'semantic-ui-react';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { startStopwatch, stopStopwatch } from '../../../utils/stopwatch';
import { isListArchiveOrTrash } from '../../../utils/record-helpers';
import { BoardMembershipRoles, BoardViews } from '../../../constants/Enums';
import TaskList from './TaskList';
import DueDateChip from '../DueDateChip';
import StopwatchChip from '../StopwatchChip';
import UserAvatar from '../../users/UserAvatar';
import LabelChip from '../../labels/LabelChip';
import CustomFieldValueChip from '../../custom-field-values/CustomFieldValueChip';

import styles from './ProjectContent.module.scss';

const ProjectContent = React.memo(({ cardId }) => {
  const selectCardById = useMemo(() => selectors.makeSelectCardById(), []);
  const selectListById = useMemo(() => selectors.makeSelectListById(), []);
  const selectUserIdsByCardId = useMemo(() => selectors.makeSelectUserIdsByCardId(), []);
  const selectLabelIdsByCardId = useMemo(() => selectors.makeSelectLabelIdsByCardId(), []);

  const selectShownOnFrontOfCardTaskListIdsByCardId = useMemo(
    () => selectors.makeSelectShownOnFrontOfCardTaskListIdsByCardId(),
    [],
  );

  const selectAttachmentsTotalByCardId = useMemo(
    () => selectors.makeSelectAttachmentsTotalByCardId(),
    [],
  );

  const selectShownOnFrontOfCardCustomFieldValueIdsByCardId = useMemo(
    () => selectors.makeSelectShownOnFrontOfCardCustomFieldValueIdsByCardId(),
    [],
  );

  const selectNotificationsTotalByCardId = useMemo(
    () => selectors.makeSelectNotificationsTotalByCardId(),
    [],
  );

  const selectAttachmentById = useMemo(() => selectors.makeSelectAttachmentById(), []);

  const card = useSelector((state) => selectCardById(state, cardId));
  const list = useSelector((state) => selectListById(state, card.listId));
  const userIds = useSelector((state) => selectUserIdsByCardId(state, cardId));
  const labelIds = useSelector((state) => selectLabelIdsByCardId(state, cardId));

  const taskListIds = useSelector((state) =>
    selectShownOnFrontOfCardTaskListIdsByCardId(state, cardId),
  );

  const attachmentsTotal = useSelector((state) => selectAttachmentsTotalByCardId(state, cardId));

  const customFieldValueIds = useSelector((state) =>
    selectShownOnFrontOfCardCustomFieldValueIdsByCardId(state, cardId),
  );

  const notificationsTotal = useSelector((state) =>
    selectNotificationsTotalByCardId(state, cardId),
  );

  const coverUrl = useSelector((state) => {
    const attachment = selectAttachmentById(state, card.coverAttachmentId);
    return attachment && attachment.data.thumbnailUrls.outside360;
  });

  const { listName, withCreator } = useSelector((state) => {
    const board = selectors.selectCurrentBoard(state);

    return {
      listName: list.name && (board.view === BoardViews.KANBAN ? null : list.name),
      withCreator: board.alwaysDisplayCardCreator,
    };
  }, shallowEqual);

  const canEditStopwatch = useSelector((state) => {
    if (isListArchiveOrTrash(list)) {
      return false;
    }

    const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
    return !!boardMembership && boardMembership.role === BoardMembershipRoles.EDITOR;
  });

  const dispatch = useDispatch();

  const handleToggleStopwatchClick = useCallback(
    (event) => {
      event.stopPropagation();

      dispatch(
        entryActions.updateCard(cardId, {
          stopwatch: card.stopwatch.startedAt
            ? stopStopwatch(card.stopwatch)
            : startStopwatch(card.stopwatch),
        }),
      );
    },
    [cardId, card.stopwatch, dispatch],
  );

  const hasInformation =
    card.description ||
    card.dueDate ||
    card.stopwatch ||
    card.commentsTotal > 0 ||
    attachmentsTotal > 0 ||
    notificationsTotal > 0 ||
    listName;

  const isCompact =
    (labelIds.length === 0 || customFieldValueIds.length === 0) &&
    taskListIds.length === 0 &&
    !hasInformation;

  const usersNode =
    userIds.length > 0 || withCreator ? (
      <span className={classNames(styles.attachments, styles.attachmentsRight)}>
        {withCreator && (
          <>
            <span className={classNames(styles.attachment, styles.attachmentRight)}>
              <UserAvatar withCreatorIndicator id={card.creatorUserId} size="small" />
            </span>
            {userIds.length > 0 && <span className={styles.creatorDivider} />}
          </>
        )}
        {userIds.map((userId) => (
          <span key={userId} className={classNames(styles.attachment, styles.attachmentRight)}>
            <UserAvatar id={userId} size="small" />
          </span>
        ))}
      </span>
    ) : null;

  return (
    <div className={styles.wrapper}>
      <div className={classNames(styles.name, card.isClosed && styles.nameClosed)}>{card.name}</div>
      {coverUrl && (
        <div className={styles.coverWrapper}>
          <img src={coverUrl} alt="" className={styles.cover} />
        </div>
      )}
      {labelIds.length > 0 && (
        <span className={classNames(styles.labels, !isCompact && styles.labelsFull)}>
          {labelIds.map((labelId) => (
            <span key={labelId} className={classNames(styles.attachment, styles.attachmentLeft)}>
              <LabelChip id={labelId} size="tiny" />
            </span>
          ))}
        </span>
      )}
      {customFieldValueIds.length > 0 && (
        <span className={classNames(styles.labels, !isCompact && styles.labelsFull)}>
          {customFieldValueIds.map((customFieldValueId) => (
            <span
              key={customFieldValueId}
              className={classNames(styles.attachment, styles.attachmentLeft)}
            >
              <CustomFieldValueChip id={customFieldValueId} size="tiny" />
            </span>
          ))}
        </span>
      )}
      {isCompact && usersNode}
      {taskListIds.map((taskListId) => (
        <TaskList key={taskListId} id={taskListId} />
      ))}
      {hasInformation && (
        <span className={styles.attachments}>
          {notificationsTotal > 0 && (
            <span
              className={classNames(styles.attachment, styles.attachmentLeft, styles.notification)}
            >
              {notificationsTotal}
            </span>
          )}
          {card.dueDate && (
            <span className={classNames(styles.attachment, styles.attachmentLeft)}>
              <DueDateChip value={card.dueDate} size="tiny" withStatus={!card.isClosed} />
            </span>
          )}
          {card.stopwatch && (
            <span className={classNames(styles.attachment, styles.attachmentLeft)}>
              <StopwatchChip
                value={card.stopwatch}
                as="span"
                size="tiny"
                onClick={canEditStopwatch ? handleToggleStopwatchClick : undefined}
              />
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
          {card.description && (
            <span className={classNames(styles.attachment, styles.attachmentLeft)}>
              <span className={styles.attachmentContent}>
                <Icon name="align left" />
              </span>
            </span>
          )}
          {attachmentsTotal > 0 && (
            <span className={classNames(styles.attachment, styles.attachmentLeft)}>
              <span className={styles.attachmentContent}>
                <Icon name="attach" />
                {attachmentsTotal}
              </span>
            </span>
          )}
          {card.commentsTotal > 0 && (
            <span className={classNames(styles.attachment, styles.attachmentLeft)}>
              <span className={styles.attachmentContent}>
                <Icon name="comment outline" />
                {card.commentsTotal}
              </span>
            </span>
          )}
        </span>
      )}
      {!isCompact && usersNode}
    </div>
  );
});

ProjectContent.propTypes = {
  cardId: PropTypes.string.isRequired,
};

export default ProjectContent;
