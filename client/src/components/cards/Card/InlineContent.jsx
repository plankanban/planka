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
import { usePopup } from '../../../lib/popup';
import { isListArchiveOrTrash } from '../../../utils/record-helpers';
import markdownToText from '../../../utils/markdown-to-text';
import { BoardMembershipRoles, BoardViews } from '../../../constants/Enums';
import UserAvatar from '../../users/UserAvatar';
import LabelChip from '../../labels/LabelChip';
import LabelsStep from '../../labels/LabelsStep';

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

  const { listName, withLabelPlaceholder } = useSelector((state) => {
    const board = selectors.selectCurrentBoard(state);
    const view = board && board.view;

    return {
      listName: list.name && view !== BoardViews.KANBAN ? list.name : null,
      withLabelPlaceholder: !!board && board.displayLabelPlaceholderOnUnlabeledCards,
    };
  }, shallowEqual);

  const canEditLabels = useSelector((state) => {
    if (isListArchiveOrTrash(list)) {
      return false;
    }

    const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
    return !!boardMembership && boardMembership.role === BoardMembershipRoles.EDITOR;
  });

  const dispatch = useDispatch();

  const handleLabelsButtonClick = useCallback((event) => {
    event.stopPropagation();
  }, []);

  const handleLabelSelect = useCallback(
    (labelId) => {
      dispatch(entryActions.addLabelToCard(labelId, cardId));
    },
    [cardId, dispatch],
  );

  const handleLabelDeselect = useCallback(
    (labelId) => {
      dispatch(entryActions.removeLabelFromCard(labelId, cardId));
    },
    [cardId, dispatch],
  );

  const LabelsPopup = usePopup(LabelsStep);

  const showLabelPlaceholder = labelIds.length === 0 && withLabelPlaceholder && canEditLabels;

  const descriptionText = useMemo(
    () => card.description && markdownToText(card.description),
    [card.description],
  );

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
      {(labelIds.length > 0 || showLabelPlaceholder) &&
        (canEditLabels ? (
          <LabelsPopup
            currentIds={labelIds}
            cardId={cardId}
            onSelect={handleLabelSelect}
            onDeselect={handleLabelDeselect}
          >
            <button
              type="button"
              onClick={handleLabelsButtonClick}
              className={classNames(styles.labelsButton, styles.hidable)}
            >
              {labelIds.length > 0 ? (
                labelIds.map((labelId) => (
                  <span
                    key={labelId}
                    className={classNames(styles.attachment, styles.attachmentLeft)}
                  >
                    <LabelChip id={labelId} size="tiny" />
                  </span>
                ))
              ) : (
                <span className={styles.labelsPlaceholder} />
              )}
            </button>
          </LabelsPopup>
        ) : (
          <span className={classNames(styles.attachments, styles.hidable)}>
            {labelIds.map((labelId) => (
              <span key={labelId} className={classNames(styles.attachment, styles.attachmentLeft)}>
                <LabelChip id={labelId} size="tiny" />
              </span>
            ))}
          </span>
        ))}
      <span
        className={classNames(styles.attachments, styles.name, card.isClosed && styles.nameClosed)}
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
