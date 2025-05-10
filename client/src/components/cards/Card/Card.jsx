/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Button, Icon } from 'semantic-ui-react';
import { push } from '../../../lib/redux-router';
import { usePopup } from '../../../lib/popup';

import selectors from '../../../selectors';
import { isListArchiveOrTrash } from '../../../utils/record-helpers';
import Paths from '../../../constants/Paths';
import { BoardMembershipRoles, CardTypes, ListTypes } from '../../../constants/Enums';
import ProjectContent from './ProjectContent';
import StoryContent from './StoryContent';
import InlineContent from './InlineContent';
import EditName from './EditName';
import ActionsStep from './ActionsStep';

import styles from './Card.module.scss';

const Card = React.memo(({ id, isInline }) => {
  const selectCardById = useMemo(() => selectors.makeSelectCardById(), []);
  const selectIsCardWithIdRecent = useMemo(() => selectors.makeSelectIsCardWithIdRecent(), []);
  const selectListById = useMemo(() => selectors.makeSelectListById(), []);

  const card = useSelector((state) => selectCardById(state, id));

  const isHighlightedAsRecent = useSelector((state) => {
    const { turnOffRecentCardHighlighting } = selectors.selectCurrentUser(state);

    if (turnOffRecentCardHighlighting) {
      return false;
    }

    return selectIsCardWithIdRecent(state, id);
  });

  const { isDisabled, canUseActions } = useSelector((state) => {
    const list = selectListById(state, card.listId);

    const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
    const isEditor = !!boardMembership && boardMembership.role === BoardMembershipRoles.EDITOR;

    if (isListArchiveOrTrash(list)) {
      return {
        isDisabled: false,
        canUseActions: isEditor,
      };
    }

    return {
      isDisabled: list.type === ListTypes.CLOSED && !isEditor,
      canUseActions: isEditor,
    };
  }, shallowEqual);

  const dispatch = useDispatch();
  const [isEditNameOpened, setIsEditNameOpened] = useState(false);

  const handleClick = useCallback(() => {
    if (document.activeElement) {
      document.activeElement.blur();
    }

    dispatch(push(Paths.CARDS.replace(':id', id)));
  }, [id, dispatch]);

  const handleNameEdit = useCallback(() => {
    setIsEditNameOpened(true);
  }, []);

  const handleEditNameClose = useCallback(() => {
    setIsEditNameOpened(false);
  }, []);

  const ActionsPopup = usePopup(ActionsStep);

  if (isEditNameOpened) {
    return <EditName cardId={id} onClose={handleEditNameClose} />;
  }

  let Content;
  if (isInline) {
    Content = InlineContent;
  } else {
    switch (card.type) {
      case CardTypes.PROJECT:
        Content = ProjectContent;

        break;
      case CardTypes.STORY:
        Content = StoryContent;

        break;
      default:
    }
  }

  return (
    <div
      className={classNames(
        styles.wrapper,
        isDisabled && styles.wrapperDisabled,
        isHighlightedAsRecent && styles.wrapperRecent,
        'card',
      )}
    >
      {card.isPersisted ? (
        <>
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,
                                       jsx-a11y/no-static-element-interactions */}
          <div className={styles.content} onClick={handleClick}>
            <Content cardId={id} />
          </div>
          {canUseActions && (
            <ActionsPopup cardId={id} onNameEdit={handleNameEdit}>
              <Button className={styles.actionsButton}>
                <Icon fitted name="pencil" size="small" />
              </Button>
            </ActionsPopup>
          )}
        </>
      ) : (
        <span className={styles.content}>
          <Content cardId={id} />
        </span>
      )}
    </div>
  );
});

Card.propTypes = {
  id: PropTypes.string.isRequired,
  isInline: PropTypes.bool,
};

Card.defaultProps = {
  isInline: false,
};

export default Card;
