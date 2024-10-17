import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Comment, Icon, Loader, Visibility } from 'semantic-ui-react';

import { ActivityTypes } from '../../../constants/Enums';
import CommentAdd from './CommentAdd';
import Item from './Item';

import styles from './Activities.module.scss';

const Activities = React.memo(
  ({
    items,
    isFetching,
    isAllFetched,
    isDetailsVisible,
    isDetailsFetching,
    canEdit,
    canEditAllComments,
    onFetch,
    onDetailsToggle,
    onCommentCreate,
    onCommentUpdate,
    onCommentDelete,
  }) => {
    const [t] = useTranslation();

    const handleToggleDetailsClick = useCallback(() => {
      onDetailsToggle(!isDetailsVisible);
    }, [isDetailsVisible, onDetailsToggle]);

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
      <div className={styles.contentModule}>
        <div className={styles.moduleWrapper}>
          <Icon name="list ul" className={styles.moduleIcon} />
          <div className={styles.moduleHeader}>
            {t('common.actions')}
            <Button
              content={isDetailsVisible ? t('action.hideDetails') : t('action.showDetails')}
              className={styles.toggleButton}
              onClick={handleToggleDetailsClick}
            />
          </div>
          {canEdit && <CommentAdd onCreate={onCommentCreate} />}
          <div className={styles.wrapper}>
            <Comment.Group>
              {items.map((item) =>
                item.type === ActivityTypes.COMMENT_CARD ? (
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
          {isFetching || isDetailsFetching ? (
            <Loader active inverted inline="centered" size="small" className={styles.loader} />
          ) : (
            !isAllFetched && <Visibility fireOnMount onOnScreen={onFetch} />
          )}
        </div>
      </div>
    );
  },
);

Activities.propTypes = {
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isFetching: PropTypes.bool.isRequired,
  isAllFetched: PropTypes.bool.isRequired,
  isDetailsVisible: PropTypes.bool.isRequired,
  isDetailsFetching: PropTypes.bool.isRequired,
  canEdit: PropTypes.bool.isRequired,
  canEditAllComments: PropTypes.bool.isRequired,
  onFetch: PropTypes.func.isRequired,
  onDetailsToggle: PropTypes.func.isRequired,
  onCommentCreate: PropTypes.func.isRequired,
  onCommentUpdate: PropTypes.func.isRequired,
  onCommentDelete: PropTypes.func.isRequired,
};

export default Activities;
