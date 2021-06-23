import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Comment, Icon, Loader, Visibility } from 'semantic-ui-react';

import { ActionTypes } from '../../../constants/Enums';
import CommentAdd from './CommentAdd';
import Item from './Item';

import styles from './Actions.module.scss';

const Actions = React.memo(
  ({
    items,
    isFetching,
    isAllFetched,
    canEdit,
    canEditAllComments,
    onFetch,
    onCommentCreate,
    onCommentUpdate,
    onCommentDelete,
  }) => {
    const [t] = useTranslation();

    const handleCommentUpdate = useCallback(
      (id, data) => {
        onCommentUpdate(id, data);
      },
      [onCommentUpdate],
    );

    const handleCommentDelete = useCallback(
      (id) => {
        onCommentDelete(id);
      },
      [onCommentDelete],
    );

    return (
      <>
        {canEdit && (
          <div className={styles.contentModule}>
            <div className={styles.moduleWrapper}>
              <Icon name="comment outline" className={styles.moduleIcon} />
              <div className={styles.moduleHeader}>{t('common.addComment')}</div>
              <CommentAdd onCreate={onCommentCreate} />
            </div>
          </div>
        )}
        <div className={styles.contentModule}>
          <div className={styles.moduleWrapper}>
            <Icon name="list ul" className={styles.moduleIcon} />
            <div className={styles.moduleHeader}>{t('common.actions')}</div>
            <div className={styles.wrapper}>
              <Comment.Group>
                {items.map((item) =>
                  item.type === ActionTypes.COMMENT_CARD ? (
                    <Item.Comment
                      key={item.id}
                      data={item.data}
                      createdAt={item.createdAt}
                      isPersisted={item.isPersisted}
                      user={item.user}
                      canEdit={(item.user.isCurrent && canEdit) || canEditAllComments}
                      onUpdate={(data) => handleCommentUpdate(item.id, data)}
                      onDelete={() => handleCommentDelete(item.id)}
                    />
                  ) : (
                    <Item
                      key={item.id}
                      type={item.type}
                      data={item.data}
                      createdAt={item.createdAt}
                      user={item.user}
                    />
                  ),
                )}
              </Comment.Group>
            </div>
            {isFetching ? (
              <Loader active inverted inline="centered" size="small" className={styles.loader} />
            ) : (
              !isAllFetched && <Visibility fireOnMount onOnScreen={onFetch} />
            )}
          </div>
        </div>
      </>
    );
  },
);

Actions.propTypes = {
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isFetching: PropTypes.bool.isRequired,
  isAllFetched: PropTypes.bool.isRequired,
  canEdit: PropTypes.bool.isRequired,
  canEditAllComments: PropTypes.bool.isRequired,
  onFetch: PropTypes.func.isRequired,
  onCommentCreate: PropTypes.func.isRequired,
  onCommentUpdate: PropTypes.func.isRequired,
  onCommentDelete: PropTypes.func.isRequired,
};

export default Actions;
