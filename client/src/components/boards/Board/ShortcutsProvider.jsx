/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { push } from '../../../lib/redux-router';
import { useDidUpdate } from '../../../lib/hooks';
import { closePopup } from '../../../lib/popup';

import store from '../../../store';
import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { isListArchiveOrTrash } from '../../../utils/record-helpers';
import { isActiveTextElement } from '../../../utils/element-helpers';
import { isModifierKeyPressed } from '../../../utils/event-helpers';
import { BoardShortcutsContext } from '../../../contexts';
import Paths from '../../../constants/Paths';
import {
  BoardContexts,
  BoardMembershipRoles,
  BoardViews,
  ListTypes,
} from '../../../constants/Enums';
import CardActionsStep from '../../cards/CardActionsStep';

const canCopyCard = (isManager, boardMembership) => {
  if (isManager) {
    return true;
  }

  return !!boardMembership && boardMembership.role === BoardMembershipRoles.EDITOR;
};

const canCutCard = (boardMembership) =>
  !!boardMembership && boardMembership.role === BoardMembershipRoles.EDITOR;

const canPasteCard = (boardMembership) =>
  !!boardMembership && boardMembership.role === BoardMembershipRoles.EDITOR;

const canEditCardName = (boardMembership, list) => {
  if (isListArchiveOrTrash(list)) {
    return false;
  }

  return !!boardMembership && boardMembership.role === BoardMembershipRoles.EDITOR;
};

const canArchiveCard = (boardMembership, list) => {
  if (list.type === ListTypes.ARCHIVE) {
    return false;
  }

  return !!boardMembership && boardMembership.role === BoardMembershipRoles.EDITOR;
};

const canUseCardMembers = (boardMembership, list) => {
  if (isListArchiveOrTrash(list)) {
    return false;
  }

  return !!boardMembership && boardMembership.role === BoardMembershipRoles.EDITOR;
};

const canUseCardLabels = (boardMembership, list) => {
  if (isListArchiveOrTrash(list)) {
    return false;
  }

  return !!boardMembership && boardMembership.role === BoardMembershipRoles.EDITOR;
};

const ShortcutsProvider = React.memo(({ children }) => {
  const { cardId, boardId } = useSelector(selectors.selectPath);

  const dispatch = useDispatch();

  const selectedListRef = useRef(null);
  const selectedCardRef = useRef(null);

  const handleListMouseEnter = useCallback((id, onPaste) => {
    selectedListRef.current = {
      id,
      onPaste,
    };
  }, []);

  const handleListMouseLeave = useCallback(() => {
    selectedListRef.current = null;
  }, []);

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
    () => [handleListMouseEnter, handleListMouseLeave, handleCardMouseEnter, handleCardMouseLeave],
    [handleListMouseEnter, handleListMouseLeave, handleCardMouseEnter, handleCardMouseLeave],
  );

  useDidUpdate(() => {
    selectedListRef.current = null;
    selectedCardRef.current = null;
  }, [cardId, boardId]);

  useEffect(() => {
    const handleCardCopy = (event) => {
      if (!selectedCardRef.current) {
        return;
      }

      const state = store.getState();
      const card = selectors.selectCardById(state, selectedCardRef.current.id);

      if (!card || !card.isPersisted) {
        return;
      }

      const isManager = selectors.selectIsCurrentUserManagerForCurrentProject(state);
      const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);

      if (!canCopyCard(isManager, boardMembership)) {
        return;
      }

      event.preventDefault();
      dispatch(entryActions.copyCard(card.id));
    };

    const handleCardCut = (event) => {
      if (!selectedCardRef.current) {
        return;
      }

      const state = store.getState();
      const card = selectors.selectCardById(state, selectedCardRef.current.id);

      if (!card || !card.isPersisted) {
        return;
      }

      const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);

      if (!canCutCard(boardMembership)) {
        return;
      }

      event.preventDefault();
      dispatch(entryActions.cutCard(card.id));
    };

    const handleCardPaste = (event) => {
      const state = store.getState();
      const clipboard = selectors.selectClipboard(state);

      if (!clipboard) {
        return;
      }

      const board = selectors.selectCurrentBoard(state);

      let listId;
      if (board.context === BoardContexts.BOARD) {
        if (board.view === BoardViews.KANBAN) {
          listId = selectedListRef.current?.id;
        } else {
          listId = selectors.selectFirstKanbanListId(state);
        }
      } else {
        listId = selectors.selectCurrentListId(state);
      }

      if (!listId) {
        return;
      }

      const list = selectors.selectListById(state, listId);

      if (!list || !list.isPersisted) {
        return;
      }

      const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);

      if (!canPasteCard(boardMembership)) {
        return;
      }

      event.preventDefault();
      dispatch(entryActions.pasteCard(list.id));

      if (selectedListRef.current) {
        selectedListRef.current.onPaste();
      }
    };

    const handleCardOpen = (event) => {
      if (!selectedCardRef.current) {
        return;
      }

      const state = store.getState();
      const card = selectors.selectCardById(state, selectedCardRef.current.id);

      if (!card || !card.isPersisted) {
        return;
      }

      event.preventDefault();

      closePopup();
      dispatch(push(Paths.CARDS.replace(':id', card.id)));
    };

    const handleCardNameEdit = (event) => {
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

      event.preventDefault();
      selectedCardRef.current.editName();
    };

    const handleCardArchive = (event) => {
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

      event.preventDefault();
      selectedCardRef.current.openActions(CardActionsStep.StepTypes.ARCHIVE);
    };

    const handleCardMembers = (event) => {
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

      event.preventDefault();
      selectedCardRef.current.openActions(CardActionsStep.StepTypes.MEMBERS);
    };

    const handleCardLabels = (event) => {
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

      event.preventDefault();
      selectedCardRef.current.openActions(CardActionsStep.StepTypes.LABELS);
    };

    const handleLabelToCardAdd = (event) => {
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

      const index = event.code === 'Digit0' ? 10 : parseInt(event.code.slice(-1), 10) - 1;
      const label = selectors.selectLabelsForCurrentBoard(state)[index];

      if (!label) {
        return;
      }

      event.preventDefault();
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
        switch (event.key) {
          case 'c':
            handleCardCopy(event);

            break;
          case 'x':
            handleCardCut(event);

            break;
          case 'v':
            handleCardPaste(event);

            break;
          default:
        }

        return;
      }

      switch (event.code) {
        case 'KeyE':
        case 'Enter':
          handleCardOpen(event);

          break;
        case 'KeyL':
          handleCardLabels(event);

          break;
        case 'KeyM':
          handleCardMembers(event);

          break;
        case 'KeyT':
          handleCardNameEdit(event);

          break;
        case 'KeyV':
          handleCardArchive(event);

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
        case 'Digit0':
          handleLabelToCardAdd(event);

          break;
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
