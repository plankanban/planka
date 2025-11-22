/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Icon } from 'semantic-ui-react';
import { push } from '../../../lib/redux-router';
import { closePopup, usePopup } from '../../../lib/popup';

import selectors from '../../../selectors';
import Paths from '../../../constants/Paths';
import { BoardMembershipRoles, CardTypes } from '../../../constants/Enums';
import { CardKeyboardShortcutsContext } from '../../../contexts';
import ProjectContent from './ProjectContent';
import StoryContent from './StoryContent';
import InlineContent from './InlineContent';
import EditName from './EditName';
import ActionsStep from './ActionsStep';

import styles from './Card.module.scss';
import globalStyles from '../../../styles.module.scss';

const Card = React.memo(({ id, isInline }) => {
  const selectCardById = useMemo(() => selectors.makeSelectCardById(), []);
  const selectIsCardWithIdRecent = useMemo(() => selectors.makeSelectIsCardWithIdRecent(), []);
  const selectListById = useMemo(() => selectors.makeSelectListById(), []);
  const selectLabelIdsByCardId = useMemo(() => selectors.makeSelectLabelIdsByCardId(), []);

  const card = useSelector((state) => selectCardById(state, id));
  const list = useSelector((state) => selectListById(state, card.listId));
  const labelIds = useSelector((state) => selectLabelIdsByCardId(state, id));

  const isHighlightedAsRecent = useSelector((state) => {
    const { turnOffRecentCardHighlighting } = selectors.selectCurrentUser(state);

    if (turnOffRecentCardHighlighting) {
      return false;
    }

    return selectIsCardWithIdRecent(state, id);
  });

  const canUseActions = useSelector((state) => {
    const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
    return !!boardMembership && boardMembership.role === BoardMembershipRoles.EDITOR;
  });

  const dispatch = useDispatch();
  const [isEditNameOpened, setIsEditNameOpened] = useState(false);

  const actionsPopupRef = useRef(null);
  const cardRef = useRef(null);

  // Get keyboard shortcuts context
  const { setHoveredCard, clearHoveredCard } = useContext(CardKeyboardShortcutsContext);

  const handleClick = useCallback(() => {
    if (document.activeElement) {
      document.activeElement.blur();
    }

    dispatch(push(Paths.CARDS.replace(':id', id)));
  }, [id, dispatch]);

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

  const handleMouseEnter = useCallback(() => {
    setHoveredCard(id, labelIds);
  }, [id, labelIds, setHoveredCard]);

  const handleMouseLeave = useCallback(() => {
    clearHoveredCard();
  }, [clearHoveredCard]);

  // Listen for custom edit title event from keyboard shortcut
  useEffect(() => {
    const handleEditTitle = () => {
      setIsEditNameOpened(true);
    };

    const element = cardRef.current;
    if (element) {
      element.addEventListener('editTitle', handleEditTitle);
      return () => {
        element.removeEventListener('editTitle', handleEditTitle);
      };
    }

    return undefined;
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

  const colorLineNode = list.color && (
    <div
      className={classNames(
        styles.colorLine,
        globalStyles[`background${upperFirst(camelCase(list.color))}`],
      )}
    />
  );

  return (
    <div
      ref={cardRef}
      data-card-id={id}
      className={classNames(styles.wrapper, isHighlightedAsRecent && styles.wrapperRecent, 'card')}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {card.isPersisted ? (
        <>
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,
                                       jsx-a11y/no-static-element-interactions */}
          <div
            className={classNames(styles.content, card.isClosed && styles.contentDisabled)}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
          >
            <Content cardId={id} />
            {colorLineNode}
          </div>
          {canUseActions && (
            <ActionsPopup ref={actionsPopupRef} cardId={id} onNameEdit={handleNameEdit}>
              <Button className={styles.actionsButton}>
                <Icon fitted name="pencil" size="small" />
              </Button>
            </ActionsPopup>
          )}
        </>
      ) : (
        <span className={classNames(styles.content, card.isClosed && styles.contentDisabled)}>
          <Content cardId={id} />
          {colorLineNode}
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
