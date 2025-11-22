/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import selectors from '../selectors';
import entryActions from '../entry-actions';
import { isActiveTextElement } from '../utils/element-helpers';
import { BoardMembershipRoles } from '../constants/Enums';

/**
 * Hook to manage keyboard shortcuts for cards in the board view.
 * Tracks the currently hovered card and handles keyboard shortcuts without prefix keys.
 *
 * Shortcuts:
 * - c: Archive card
 * - t: Edit card title (opens edit mode)
 * - e: Open card (same as clicking it)
 * - 1-9: Toggle label at position (1-based index)
 */
export default function useCardKeyboardShortcuts() {
  const hoveredCardIdRef = useRef(null);
  const hoveredCardLabelIdsRef = useRef([]);
  const dispatch = useDispatch();

  const labels = useSelector(selectors.selectLabelsForCurrentBoard);

  const canEdit = useSelector((state) => {
    const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
    return !!boardMembership && boardMembership.role === BoardMembershipRoles.EDITOR;
  });

  // Set the currently hovered card and its labels
  const setHoveredCard = useCallback((cardId, labelIds = []) => {
    hoveredCardIdRef.current = cardId;
    hoveredCardLabelIdsRef.current = labelIds;
  }, []);

  // Clear the hovered card
  const clearHoveredCard = useCallback(() => {
    hoveredCardIdRef.current = null;
    hoveredCardLabelIdsRef.current = [];
  }, []);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ignore if typing in a text field
      if (isActiveTextElement(event.target)) {
        return;
      }

      // Ignore if no card is hovered
      if (!hoveredCardIdRef.current) {
        return;
      }

      // Ignore if user can't edit
      if (!canEdit) {
        return;
      }

      const cardId = hoveredCardIdRef.current;
      const key = event.key.toLowerCase();

      // Handle shortcuts
      switch (key) {
        case 'c':
          // Archive card
          event.preventDefault();
          dispatch(entryActions.moveCardToArchive(cardId));
          break;

        case 't': {
          // Edit title - dispatch a custom event to the card to enter edit mode
          event.preventDefault();
          const cardElementForTitle = document.querySelector(`[data-card-id="${cardId}"]`);
          if (cardElementForTitle) {
            cardElementForTitle.dispatchEvent(new CustomEvent('editTitle'));
          }
          break;
        }

        case 'e':
        case 'enter': {
          // Open card modal
          event.preventDefault();
          const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
          if (cardElement) {
            const contentElement = cardElement.querySelector('[class*="content"]');
            if (contentElement) {
              contentElement.click();
            }
          }
          break;
        }

        default:
          // Handle number keys 1-9 for label toggling
          if (key >= '1' && key <= '9') {
            const labelIndex = parseInt(key, 10) - 1;

            if (labelIndex < labels.length) {
              event.preventDefault();
              const label = labels[labelIndex];

              // Check if card already has this label using the stored ref
              const hasLabel = hoveredCardLabelIdsRef.current.includes(label.id);

              if (hasLabel) {
                dispatch(entryActions.removeLabelFromCard(label.id, cardId));
              } else {
                dispatch(entryActions.addLabelToCard(label.id, cardId));
              }
            }
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dispatch, canEdit, labels]);

  return {
    setHoveredCard,
    clearHoveredCard,
  };
}
