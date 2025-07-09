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
import { BoardViews } from '../../../constants/Enums';
import LabelChip from '../../labels/LabelChip';
import CustomFieldValueChip from '../../custom-field-values/CustomFieldValueChip';

import styles from './StoryContent.module.scss';

const StoryContent = React.memo(({ cardId }) => {
  const selectCardById = useMemo(() => selectors.makeSelectCardById(), []);
  const selectListById = useMemo(() => selectors.makeSelectListById(), []);
  const selectLabelIdsByCardId = useMemo(() => selectors.makeSelectLabelIdsByCardId(), []);

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
  const labelIds = useSelector((state) => selectLabelIdsByCardId(state, cardId));
  const attachmentsTotal = useSelector((state) => selectAttachmentsTotalByCardId(state, cardId));

  const customFieldValueIds = useSelector((state) =>
    selectShownOnFrontOfCardCustomFieldValueIdsByCardId(state, cardId),
  );

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

  const coverUrl = useSelector((state) => {
    const attachment = selectAttachmentById(state, card.coverAttachmentId);
    return attachment && attachment.data.thumbnailUrls.outside360;
  });

  const descriptionText = useMemo(
    () => card.description && markdownToText(card.description),
    [card.description],
  );

  return (
    <>
      {coverUrl && (
        <div className={styles.coverWrapper}>
          <img src={coverUrl} alt="" className={styles.cover} />
        </div>
      )}
      <div className={styles.wrapper}>
        {labelIds.length > 0 && (
          <span className={styles.labels}>
            {labelIds.map((labelId) => (
              <span key={labelId} className={classNames(styles.attachment, styles.attachmentLeft)}>
                <LabelChip id={labelId} size="tiny" />
              </span>
            ))}
          </span>
        )}
        {customFieldValueIds.length > 0 && (
          <span className={classNames(styles.labels)}>
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
        <div className={classNames(styles.name, card.isClosed && styles.nameClosed)}>
          {card.name}
        </div>
        {card.description && <div className={styles.descriptionText}>{descriptionText}</div>}
        {(attachmentsTotal > 0 || notificationsTotal > 0 || listName) && (
          <span className={styles.attachments}>
            {notificationsTotal > 0 && (
              <span
                className={classNames(
                  styles.attachment,
                  styles.attachmentLeft,
                  styles.notification,
                )}
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
            {attachmentsTotal > 0 && (
              <span className={classNames(styles.attachment, styles.attachmentLeft)}>
                <span className={styles.attachmentContent}>
                  <Icon name="attach" />
                  {attachmentsTotal}
                </span>
              </span>
            )}
          </span>
        )}
      </div>
    </>
  );
});

StoryContent.propTypes = {
  cardId: PropTypes.string.isRequired,
};

export default StoryContent;
