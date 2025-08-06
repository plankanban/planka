/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Comment } from 'semantic-ui-react';
import { useDidUpdate } from '../../../lib/hooks';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { usePopupInClosableContext } from '../../../hooks';
import { isListArchiveOrTrash } from '../../../utils/record-helpers';
import { StaticUserIds } from '../../../constants/StaticUsers';
import { BoardMembershipRoles } from '../../../constants/Enums';
import { ClosableContext } from '../../../contexts';
import Edit from './Edit';
import TimeAgo from '../../common/TimeAgo';
import Markdown from '../../common/Markdown';
import ConfirmationStep from '../../common/ConfirmationStep';
import UserAvatar from '../../users/UserAvatar';

import styles from './Item.module.scss';

const Item = React.memo(({ id }) => {
  const selectCommentById = useMemo(() => selectors.makeSelectCommentById(), []);
  const selectUserById = useMemo(() => selectors.makeSelectUserById(), []);
  const selectListById = useMemo(() => selectors.makeSelectListById(), []);

  const comment = useSelector((state) => selectCommentById(state, id));
  const user = useSelector((state) => selectUserById(state, comment.userId));

  const isCurrentUser = useSelector(
    (state) => comment.userId === selectors.selectCurrentUserId(state),
  );

  const { canEdit, canDelete } = useSelector((state) => {
    const { listId } = selectors.selectCurrentCard(state);
    const list = selectListById(state, listId);

    if (isListArchiveOrTrash(list)) {
      return {
        canEdit: false,
        canDelete: false,
      };
    }

    const isManager = selectors.selectIsCurrentUserManagerForCurrentProject(state);
    const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);

    let isMember = false;
    let isEditor = false;

    if (boardMembership) {
      isMember = true;
      isEditor = boardMembership.role === BoardMembershipRoles.EDITOR;
    }

    const canEditOrDeleteAsMember =
      isMember &&
      comment.userId === boardMembership.userId &&
      (isEditor || boardMembership.canComment);

    return {
      canEdit: canEditOrDeleteAsMember,
      canDelete: isManager || canEditOrDeleteAsMember,
    };
  }, shallowEqual);

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [isEditOpened, setIsEditOpened] = useState(false);
  const [, , setIsClosableActive] = useContext(ClosableContext);

  const handleDeleteConfirm = useCallback(() => {
    dispatch(entryActions.deleteComment(id));
  }, [id, dispatch]);

  const handleEditClick = useCallback(() => {
    setIsEditOpened(true);
  }, []);

  const handleEditClose = useCallback(() => {
    setIsEditOpened(false);
  }, []);

  useDidUpdate(() => {
    setIsClosableActive(isEditOpened);
  }, [isEditOpened]);

  const ConfirmationPopup = usePopupInClosableContext(ConfirmationStep);

  return (
    <Comment>
      {!isCurrentUser && (
        <span className={styles.user}>
          <UserAvatar id={comment.userId} />
        </span>
      )}
      <div className={classNames(styles.content, isCurrentUser && styles.contentWithoutUser)}>
        {isEditOpened ? (
          <Edit commentId={id} onClose={handleEditClose} />
        ) : (
          <div className={classNames(styles.bubble, isCurrentUser && styles.bubbleRight)}>
            <div className={styles.header}>
              {user.id === StaticUserIds.DELETED
                ? t(`common.${user.name}`, {
                    context: 'title',
                  })
                : user.name}
            </div>
            <Markdown>{comment.text}</Markdown>
            <Comment.Actions className={styles.information}>
              <span className={styles.date}>
                <TimeAgo date={comment.createdAt} />
              </span>
              {(canEdit || canDelete) && (
                <span className={styles.actions}>
                  {canEdit && (
                    <Comment.Action
                      as="button"
                      content={t('action.edit')}
                      disabled={!comment.isPersisted}
                      onClick={handleEditClick}
                    />
                  )}
                  {canDelete && (
                    <ConfirmationPopup
                      title="common.deleteComment"
                      content="common.areYouSureYouWantToDeleteThisComment"
                      buttonContent="action.deleteComment"
                      onConfirm={handleDeleteConfirm}
                    >
                      <Comment.Action
                        as="button"
                        content={t('action.delete')}
                        disabled={!comment.isPersisted}
                      />
                    </ConfirmationPopup>
                  )}
                </span>
              )}
            </Comment.Actions>
          </div>
        )}
      </div>
    </Comment>
  );
});

Item.propTypes = {
  id: PropTypes.string.isRequired,
};

export default Item;
