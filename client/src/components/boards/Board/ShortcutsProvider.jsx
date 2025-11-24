/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { push } from '../../../lib/redux-router';
import { useDidUpdate } from '../../../lib/hooks';

import store from '../../../store';
import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { isListArchiveOrTrash } from '../../../utils/record-helpers';
import { isActiveTextElement } from '../../../utils/element-helpers';
import { isModifierKeyPressed } from '../../../utils/event-helpers';
import { BoardShortcutsContext } from '../../../contexts';
import Paths from '../../../constants/Paths';
import { BoardMembershipRoles, ListTypes } from '../../../constants/Enums';
import CardActionsStep from '../../cards/CardActionsStep';

const canEditCardName = (boardMembership, list) => {
  if (isListArchiveOrTrash(list)) {
    return false;
  }

  return boardMembership && boardMembership.role === BoardMembershipRoles.EDITOR;
};

const canArchiveCard = (boardMembership, list) => {
  if (list.type === ListTypes.ARCHIVE) {
    return false;
  }

  return boardMembership && boardMembership.role === BoardMembershipRoles.EDITOR;
};

const canUseCardMembers = (boardMembership, list) => {
  if (isListArchiveOrTrash(list)) {
    return false;
  }

  return boardMembership && boardMembership.role === BoardMembershipRoles.EDITOR;
};

const canUseCardLabels = (boardMembership, list) => {
  if (isListArchiveOrTrash(list)) {
    return false;
  }

  return boardMembership && boardMembership.role === BoardMembershipRoles.EDITOR;
};

const ShortcutsProvider = React.memo(({ children }) => {
  const { cardId, boardId } = useSelector(selectors.selectPath);

  const dispatch = useDispatch();

  const selectedCardRef = useRef(null);

  const handleCardMouseEnter = useCallback((id, editName, openActions) => {
    selectedCardRef.current = {
      id,
      editName,
      openActions,
    };
  }, []);

  const handleCardMouseLeave = useCallback(() => {
    selectedCardRef.current = null;
  }, []);

  const contextValue = useMemo(
    () => [handleCardMouseEnter, handleCardMouseLeave],
    [handleCardMouseEnter, handleCardMouseLeave],
  );

  useDidUpdate(() => {
    selectedCardRef.current = null;
  }, [cardId, boardId]);

  useEffect(() => {
    const handleCardOpen = () => {
      if (!selectedCardRef.current) {
        return;
      }

      const state = store.getState();
      const card = selectors.selectCardById(state, selectedCardRef.current.id);

      if (!card || !card.isPersisted) {
        return;
      }

      dispatch(push(Paths.CARDS.replace(':id', card.id)));
    };

    const handleCardNameEdit = () => {
      if (!selectedCardRef.current) {
        return;
      }

      const state = store.getState();
      const card = selectors.selectCardById(state, selectedCardRef.current.id);

      if (!card || !card.isPersisted) {
        return;
      }

      const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
      const list = selectors.selectListById(state, card.listId);

      if (!canEditCardName(boardMembership, list)) {
        return;
      }

      selectedCardRef.current.editName();
    };

    const handleCardArchive = () => {
      if (!selectedCardRef.current) {
        return;
      }

      const state = store.getState();
      const card = selectors.selectCardById(state, selectedCardRef.current.id);

      if (!card || !card.isPersisted) {
        return;
      }

      const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
      const list = selectors.selectListById(state, card.listId);

      if (!canArchiveCard(boardMembership, list)) {
        return;
      }

      selectedCardRef.current.openActions(CardActionsStep.StepTypes.ARCHIVE);
    };

    const handleCardMembers = () => {
      if (!selectedCardRef.current) {
        return;
      }

      const state = store.getState();
      const card = selectors.selectCardById(state, selectedCardRef.current.id);

      if (!card || !card.isPersisted) {
        return;
      }

      const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
      const list = selectors.selectListById(state, card.listId);

      if (!canUseCardMembers(boardMembership, list)) {
        return;
      }

      selectedCardRef.current.openActions(CardActionsStep.StepTypes.MEMBERS);
    };

    const handleCardLabels = () => {
      if (!selectedCardRef.current) {
        return;
      }

      const state = store.getState();
      const card = selectors.selectCardById(state, selectedCardRef.current.id);

      if (!card || !card.isPersisted) {
        return;
      }

      const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
      const list = selectors.selectListById(state, card.listId);

      if (!canUseCardLabels(boardMembership, list)) {
        return;
      }

      selectedCardRef.current.openActions(CardActionsStep.StepTypes.LABELS);
    };

    const handleLabelToCardAdd = (index) => {
      if (!selectedCardRef.current) {
        return;
      }

      const state = store.getState();
      const card = selectors.selectCardById(state, selectedCardRef.current.id);

      if (!card || !card.isPersisted) {
        return;
      }

      const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
      const list = selectors.selectListById(state, card.listId);

      if (!canUseCardLabels(boardMembership, list)) {
        return;
      }

      const label = selectors.selectLabelsForCurrentBoard(state)[index];

      if (!label) {
        return;
      }

      const labelIds = selectors.selectLabelIdsByCardId(state, card.id);

      if (labelIds.includes(label.id)) {
        dispatch(entryActions.removeLabelFromCard(label.id, card.id));
      } else {
        dispatch(entryActions.addLabelToCard(label.id, card.id));
      }
    };

    const handleKeyDown = (event) => {
      if (isActiveTextElement(event.target)) {
        return;
      }

      if (isModifierKeyPressed(event)) {
        return;
      }

      switch (event.code) {
        case 'KeyE':
        case 'Enter':
          handleCardOpen();

          break;
        case 'KeyL':
          event.preventDefault();
          handleCardLabels();

          break;
        case 'KeyM':
          event.preventDefault();
          handleCardMembers();

          break;
        case 'KeyT':
          event.preventDefault();
          handleCardNameEdit();

          break;
        case 'KeyV':
          handleCardArchive();

          break;
        case 'Digit1':
        case 'Digit2':
        case 'Digit3':
        case 'Digit4':
        case 'Digit5':
        case 'Digit6':
        case 'Digit7':
        case 'Digit8':
        case 'Digit9':
        case 'Digit0': {
          const index = event.code === 'Digit0' ? 10 : parseInt(event.code.slice(-1), 10) - 1;
          handleLabelToCardAdd(index);

          break;
        }
        default:
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dispatch]);

  return (
    <BoardShortcutsContext.Provider value={contextValue}>{children}</BoardShortcutsContext.Provider>
  );
});

ShortcutsProvider.propTypes = {
  children: PropTypes.element.isRequired,
};

export default ShortcutsProvider;
