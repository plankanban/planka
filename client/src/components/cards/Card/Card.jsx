/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useContext, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Icon } from 'semantic-ui-react';
import { push } from '../../../lib/redux-router';
import { closePopup, usePopup } from '../../../lib/popup';

import selectors from '../../../selectors';
import { BoardShortcutsContext } from '../../../contexts';
import Paths from '../../../constants/Paths';
import ClipboardTypes from '../../../constants/ClipboardTypes';
import { BoardMembershipRoles, CardTypes } from '../../../constants/Enums';
import ProjectContent from './ProjectContent';
import StoryContent from './StoryContent';
import InlineContent from './InlineContent';
import EditName from './EditName';
import CardActionsStep from '../CardActionsStep';

import styles from './Card.module.scss';

const Card = React.memo(({ id, isInline }) => {
  const selectCardById = useMemo(() => selectors.makeSelectCardById(), []);
  const selectIsCardWithIdRecent = useMemo(() => selectors.makeSelectIsCardWithIdRecent(), []);

  const card = useSelector((state) => selectCardById(state, id));

  const isHighlightedAsRecent = useSelector((state) => {
    const { turnOffRecentCardHighlighting } = selectors.selectCurrentUser(state);

    if (turnOffRecentCardHighlighting) {
      return false;
    }

    return selectIsCardWithIdRecent(state, id);
  });

  const isCut = useSelector((state) => {
    const clipboard = selectors.selectClipboard(state);
    return clipboard && clipboard.type === ClipboardTypes.CUT && card.id === clipboard.cardId;
  });

  const canUseActions = useSelector((state) => {
    const isManager = selectors.selectIsCurrentUserManagerForCurrentProject(state);

    if (isManager) {
      return true;
    }

    const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
    return !!boardMembership && boardMembership.role === BoardMembershipRoles.EDITOR;
  });

  const dispatch = useDispatch();
  const [isEditNameOpened, setIsEditNameOpened] = useState(false);
  const [, , handleCardMouseEnter, handleCardMouseLeave] = useContext(BoardShortcutsContext);

  const actionsPopupRef = useRef(null);

  const handleClick = useCallback(() => {
    if (document.activeElement) {
      document.activeElement.blur();
    }

    dispatch(push(Paths.CARDS.replace(':id', id)));
  }, [id, dispatch]);

  const handleMouseEnter = useCallback(() => {
    handleCardMouseEnter(
      id,
      () => {
        setIsEditNameOpened(true);
      },
      (step) => {
        closePopup();

        actionsPopupRef.current.open({
          defaultStep: step,
        });
      },
    );
  }, [id, handleCardMouseEnter]);

  const handleContextMenu = useCallback((event) => {
    if (!actionsPopupRef.current) {
      return;
    }

    event.preventDefault();

    closePopup();
    actionsPopupRef.current.open();
  }, []);

  const handleNameEdit = useCallback(() => {
    setIsEditNameOpened(true);
  }, []);

  const handleEditNameClose = useCallback(() => {
    setIsEditNameOpened(false);
  }, []);

  const CardActionsPopup = usePopup(CardActionsStep);

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
      className={classNames(styles.wrapper, isHighlightedAsRecent && styles.wrapperRecent, 'card')}
    >
      {card.isPersisted ? (
        <>
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,
                                       jsx-a11y/no-static-element-interactions */}
          <div
            className={classNames(
              styles.content,
              card.isClosed && styles.contentDisabled,
              isCut && styles.contentCut,
            )}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleCardMouseLeave}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
          >
            <Content cardId={id} />
          </div>
          {canUseActions && (
            <CardActionsPopup ref={actionsPopupRef} cardId={id} onNameEdit={handleNameEdit}>
              <Button className={styles.actionsButton}>
                <Icon fitted name="pencil" size="small" />
              </Button>
            </CardActionsPopup>
          )}
        </>
      ) : (
        <span className={classNames(styles.content, card.isClosed && styles.contentDisabled)}>
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
