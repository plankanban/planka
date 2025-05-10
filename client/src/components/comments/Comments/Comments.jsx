/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useInView } from 'react-intersection-observer';
import { Comment, Loader } from 'semantic-ui-react';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { isListArchiveOrTrash } from '../../../utils/record-helpers';
import { BoardMembershipRoles } from '../../../constants/Enums';
import Item from './Item';
import Add from './Add';

import styles from './Comments.module.scss';

const Comments = React.memo(() => {
  const selectListById = useMemo(() => selectors.makeSelectListById(), []);

  const commentIds = useSelector(selectors.selectCommentIdsForCurrentCard);
  const { isCommentsFetching, isAllCommentsFetched } = useSelector(selectors.selectCurrentCard);

  const cadAdd = useSelector((state) => {
    const { listId } = selectors.selectCurrentCard(state);
    const list = selectListById(state, listId);

    if (isListArchiveOrTrash(list)) {
      return false;
    }

    const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);

    let isMember = false;
    let isEditor = false;

    if (boardMembership) {
      isMember = true;
      isEditor = boardMembership.role === BoardMembershipRoles.EDITOR;
    }

    return isEditor || (isMember && boardMembership.canComment);
  });

  const dispatch = useDispatch();

  const [inViewRef] = useInView({
    threshold: 1,
    onChange: (inView) => {
      if (inView) {
        dispatch(entryActions.fetchCommentsInCurrentCard());
      }
    },
  });

  return (
    <>
      {cadAdd && <Add />}
      <div className={styles.itemsWrapper}>
        <Comment.Group className={styles.items}>
          {commentIds.map((commentId) => (
            <Item key={commentId} id={commentId} />
          ))}
        </Comment.Group>
      </div>
      {isCommentsFetching !== undefined && isAllCommentsFetched !== undefined && (
        <div className={styles.loaderWrapper}>
          {isCommentsFetching ? (
            <Loader active inverted inline="centered" size="small" />
          ) : (
            !isAllCommentsFetched && <div ref={inViewRef} />
          )}
        </div>
      )}
    </>
  );
});

export default Comments;
