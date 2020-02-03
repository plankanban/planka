import React, { useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Comment } from 'semantic-ui-react';
import { Markdown } from '../../../lib/custom-ui';

import EditComment from './EditComment';
import User from '../../User';
import DeletePopup from '../../DeletePopup';

import styles from './ItemComment.module.css';

const ItemComment = React.memo(
  ({ data, createdAt, isPersisted, user, isEditable, onUpdate, onDelete }) => {
    const [t] = useTranslation();

    const editComment = useRef(null);

    const handleEditClick = useCallback(() => {
      editComment.current.open();
    }, []);

    return (
      <Comment>
        <span className={styles.user}>
          <User name={user.name} avatar={user.avatar} />
        </span>
        <div className={classNames(styles.content)}>
          <div className={styles.title}>
            <span className={styles.author}>{user.name}</span>
            <span className={styles.date}>
              {t('format:longDateTime', {
                postProcess: 'formatDate',
                value: createdAt,
              })}
            </span>
          </div>
          <EditComment ref={editComment} defaultData={data} onUpdate={onUpdate}>
            <>
              <Markdown source={data.text} linkTarget="_blank" className={styles.text} />
              <Comment.Actions>
                {user.isCurrent && (
                  <Comment.Action
                    as="button"
                    content={t('action.edit')}
                    disabled={!isPersisted}
                    onClick={handleEditClick}
                  />
                )}
                {(user.isCurrent || isEditable) && (
                  <DeletePopup
                    title={t('common.deleteComment', {
                      context: 'title',
                    })}
                    content={t('common.areYouSureYouWantToDeleteThisComment')}
                    buttonContent={t('action.deleteComment')}
                    onConfirm={onDelete}
                  >
                    <Comment.Action
                      as="button"
                      content={t('action.delete')}
                      disabled={!isPersisted}
                    />
                  </DeletePopup>
                )}
              </Comment.Actions>
            </>
          </EditComment>
        </div>
      </Comment>
    );
  },
);

ItemComment.propTypes = {
  data: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  createdAt: PropTypes.instanceOf(Date).isRequired,
  isPersisted: PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isEditable: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default ItemComment;
