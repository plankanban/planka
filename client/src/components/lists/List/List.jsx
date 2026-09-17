/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import React, { useCallback, useContext, useLayoutEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { Button, Icon } from 'semantic-ui-react';
import { useDidUpdate, useToggle, useTransitioning } from '../../../lib/hooks';
import { Tooltip } from '../../../lib/custom-ui';
import { usePopup } from '../../../lib/popup';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { BoardShortcutsContext } from '../../../contexts';
import DroppableTypes from '../../../constants/DroppableTypes';
import { recallListScroll, rememberListScroll } from '../../../utils/list-scroll-memory';
import { BoardMembershipRoles, ListTypes } from '../../../constants/Enums';
import { ListTypeIcons } from '../../../constants/Icons';
import EditName from './EditName';
import ActionsStep from './ActionsStep';
import DraggableCard from '../../cards/DraggableCard';
import AddCard from '../../cards/AddCard';
import ArchiveCardsStep from '../../cards/ArchiveCardsStep';
import PlusMathIcon from '../../../assets/images/plus-math-icon.svg?react';

import styles from './List.module.scss';
import globalStyles from '../../../styles.module.scss';

// How many frames a remembered scroll offset waits for the list to grow tall
// enough to carry it. Covers and images settle well after the list mounts, so
// the first frames are routinely too short; roughly two thirds of a second is
// long enough for that and short enough that a list whose content really has
// shrunk gives up before anyone is waiting on it.
const RESTORE_ATTEMPTS = 40;

const AddCardPositions = {
  TOP: 'top',
  BOTTOM: 'bottom',
};

const INDEX_BY_ADD_CARD_POSITION = {
  [AddCardPositions.TOP]: 0,
};

const List = React.memo(({ id, index }) => {
  const selectListById = useMemo(() => selectors.makeSelectListById(), []);

  const selectFilteredCardIdsByListId = useMemo(
    () => selectors.makeSelectFilteredCardIdsByListId(),
    [],
  );

  const selectCardCountByListId = useMemo(() => selectors.makeSelectCardCountByListId(), []);

  const clipboard = useSelector(selectors.selectClipboard);
  const isFavoritesActive = useSelector(selectors.selectIsFavoritesActiveForCurrentUser);

  // What the remembered positions belong to. They are kept for one project at a
  // time, so walking into another one starts clean rather than replaying where
  // its columns were left.
  const projectId = useSelector((state) => selectors.selectPath(state).projectId);

  const list = useSelector((state) => selectListById(state, id));
  const cardIds = useSelector((state) => selectFilteredCardIdsByListId(state, id));

  // Shown on the add-card button when the board asks for it. Counted over every
  // card the list holds, not the ones the filter leaves standing: a filter
  // hides cards, it does not remove them, and a number that fell as the filter
  // narrowed would say the list had emptied.
  const showCardCounter = useSelector(
    (state) => selectors.selectCurrentBoard(state).showCardCounter,
  );

  const cardCount = useSelector((state) => selectCardCountByListId(state, id));

  const { canEdit, canArchiveCards, canAddCard, canPasteCard, canDropCard } = useSelector(
    (state) => {
      const isEditModeEnabled = selectors.selectIsEditModeEnabled(state); // TODO: move out?

      const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
      const isEditor = !!boardMembership && boardMembership.role === BoardMembershipRoles.EDITOR;

      return {
        canEdit: isEditModeEnabled && isEditor,
        canArchiveCards: list.type === ListTypes.CLOSED && isEditor,
        canAddCard: isEditor,
        canPasteCard: isEditor,
        canDropCard: isEditor,
      };
    },
    shallowEqual,
  );

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [isEditNameOpened, setIsEditNameOpened] = useState(false);
  const [addCardPosition, setAddCardPosition] = useState(null);
  const [scrollBottomState, scrollBottom] = useToggle();
  const [handleListMouseEnter, handleListMouseLeave] = useContext(BoardShortcutsContext);

  const wrapperRef = useRef(null);
  const cardsWrapperRef = useRef(null);

  const handleCardCreate = useCallback(
    (data, autoOpen) => {
      dispatch(
        entryActions.createCard(id, data, INDEX_BY_ADD_CARD_POSITION[addCardPosition], autoOpen),
      );
    },
    [id, dispatch, addCardPosition],
  );

  const handlePasteCardClick = useCallback(() => {
    dispatch(entryActions.pasteCard(id));
    scrollBottom();
  }, [id, dispatch, scrollBottom]);

  const handleHeaderClick = useCallback(() => {
    if (list.isPersisted && canEdit) {
      setIsEditNameOpened(true);
    }
  }, [list.isPersisted, canEdit]);

  const handleAddCardClick = useCallback(() => {
    setAddCardPosition(AddCardPositions.BOTTOM);
  }, []);

  const handleAddCardClose = useCallback(() => {
    setAddCardPosition(null);
  }, []);

  const handleCardAdd = useCallback(() => {
    setAddCardPosition(AddCardPositions.TOP);
  }, []);

  // The add-card form is this list's own state, so the `+` shortcut can only
  // reach it through a callback handed to the board's shortcut provider. The
  // permission to use it is checked there, alongside the other board shortcuts.
  const handleMouseEnter = useCallback(() => {
    handleListMouseEnter(
      id,
      () => {
        scrollBottom();
      },
      handleAddCardClick,
    );
  }, [id, scrollBottom, handleListMouseEnter, handleAddCardClick]);

  const handleNameEdit = useCallback(() => {
    setIsEditNameOpened(true);
  }, []);

  const handleEditNameClose = useCallback(() => {
    setIsEditNameOpened(false);
  }, []);

  const handleWrapperTransitionEnd = useTransitioning(
    wrapperRef,
    styles.outerWrapperTransitioning,
    [isFavoritesActive],
  );

  // Put the list back where it was left, and keep noting where that is. The
  // restore runs before paint and only once per mount, so it never fights the
  // reader mid-scroll; the note is taken on the frame after a scroll rather than
  // on every event, which fires many times a flick.
  useLayoutEffect(() => {
    const wrapper = cardsWrapperRef.current;

    if (!wrapper) {
      return undefined;
    }

    const remembered = recallListScroll(projectId, id);

    let writeFrame = null;
    let restoreFrame = null;
    let attemptsLeft = RESTORE_ATTEMPTS;

    // True from mount until the offset has either landed, proved unreachable, or
    // been given up on because the reader started scrolling themselves. Nothing
    // is written while it holds — see `handleScroll`.
    let isRestoring = !!remembered;

    const note = () => {
      rememberListScroll(projectId, id, wrapper.scrollTop);
    };

    // Only ever put the list somewhere it can actually go. Asking for an offset
    // the content is too short for does not fail — the browser clamps it, and
    // the list opens pinned to its bottom, which is nowhere the reader ever was.
    // Every list of a board can do this at once: cards removed, a filter, or
    // simply a wider window, where the same cards are shorter and the whole
    // column has less to scroll.
    //
    // So the offset is applied only once the content can carry it. That also
    // answers card covers and images, which settle after this effect and grow
    // the list as they do — until they have, the list is legitimately too short.
    // Waiting is the same answer to both, and unlike clamping it can be wrong
    // only by leaving the list where it would have opened anyway.
    const restore = () => {
      restoreFrame = null;

      const element = cardsWrapperRef.current;

      if (!element) {
        return;
      }

      if (element.scrollHeight - element.clientHeight >= remembered) {
        // Instant, whatever `scroll-behavior` says: this is where the list
        // already was, not somewhere it is travelling to.
        element.scrollTo({ top: remembered, behavior: 'instant' });
        isRestoring = false;
        return;
      }

      attemptsLeft -= 1;

      if (attemptsLeft > 0) {
        restoreFrame = requestAnimationFrame(restore);
      } else {
        // It is not coming back. Forget it, so the next visit opens at the top
        // without this wait.
        isRestoring = false;
        rememberListScroll(projectId, id, 0);
      }
    };

    if (isRestoring) {
      restore();
    }

    const handleScroll = () => {
      // A list waiting for its offset sits at the top, and plenty of things make
      // it emit a scroll event while it waits — content arriving, a layout
      // settling. Noting the position then would write a 0, and a 0 means "this
      // list is at its top", which erases the very offset being waited for.
      if (isRestoring) {
        return;
      }

      if (writeFrame) {
        return;
      }

      writeFrame = requestAnimationFrame(() => {
        writeFrame = null;
        note();
      });
    };

    // The reader taking hold, as opposed to the list merely moving: a scroll
    // event says nothing about who caused it, so the restore stands down only
    // for an actual gesture. Landing on top of one would be a yank.
    const handleTakeOver = () => {
      if (restoreFrame !== null) {
        cancelAnimationFrame(restoreFrame);
        restoreFrame = null;
      }

      isRestoring = false;
    };

    wrapper.addEventListener('scroll', handleScroll, { passive: true });
    wrapper.addEventListener('wheel', handleTakeOver, { passive: true });
    wrapper.addEventListener('touchstart', handleTakeOver, { passive: true });
    wrapper.addEventListener('pointerdown', handleTakeOver, { passive: true });
    wrapper.addEventListener('keydown', handleTakeOver);

    return () => {
      if (restoreFrame !== null) {
        cancelAnimationFrame(restoreFrame);
      }

      wrapper.removeEventListener('scroll', handleScroll);
      wrapper.removeEventListener('wheel', handleTakeOver);
      wrapper.removeEventListener('touchstart', handleTakeOver);
      wrapper.removeEventListener('pointerdown', handleTakeOver);
      wrapper.removeEventListener('keydown', handleTakeOver);

      if (writeFrame) {
        cancelAnimationFrame(writeFrame);
      }

      // Scrolling and then leaving straight away is the ordinary case, and the
      // frame the note was waiting on never arrives — cancelled just above. Take
      // it now instead, or that last position is the one that goes missing.
      if (!isRestoring) {
        note();
      }
    };
  }, [id, projectId]);

  useDidUpdate(() => {
    if (!addCardPosition) {
      return;
    }

    cardsWrapperRef.current.scrollTop =
      addCardPosition === AddCardPositions.TOP ? 0 : cardsWrapperRef.current.scrollHeight;
  }, [cardIds, addCardPosition]);

  useDidUpdate(() => {
    cardsWrapperRef.current.scrollTop = cardsWrapperRef.current.scrollHeight;
  }, [scrollBottomState]);

  const cardCountNode = showCardCounter && cardCount !== null && (
    <span className={styles.addCardButtonCount}>{cardCount}</span>
  );

  const ActionsPopup = usePopup(ActionsStep);
  const ArchiveCardsPopup = usePopup(ArchiveCardsStep);

  const addCardNode = canAddCard && (
    <AddCard
      isOpened={!!addCardPosition}
      className={styles.addCard}
      onCreate={handleCardCreate}
      onClose={handleAddCardClose}
    />
  );

  const cardsNode = (
    <Droppable
      droppableId={`list:${id}`}
      type={DroppableTypes.CARD}
      isDropDisabled={!list.isPersisted || !canDropCard}
    >
      {({ innerRef, droppableProps, placeholder }) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <div {...droppableProps} ref={innerRef}>
          <div className={styles.cards}>
            {addCardPosition === AddCardPositions.TOP && addCardNode}
            {cardIds.map((cardId, cardIndex) => (
              <DraggableCard key={cardId} id={cardId} index={cardIndex} className={styles.card} />
            ))}
            {placeholder}
            {addCardPosition === AddCardPositions.BOTTOM && addCardNode}
          </div>
        </div>
      )}
    </Droppable>
  );

  return (
    <Draggable
      draggableId={`list:${id}`}
      index={index}
      isDragDisabled={!list.isPersisted || !canEdit || isEditNameOpened}
    >
      {({ innerRef, draggableProps, dragHandleProps }) => (
        <div
          {...draggableProps} // eslint-disable-line react/jsx-props-no-spreading
          data-drag-scroller
          ref={innerRef}
          className={styles.innerWrapper}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleListMouseLeave}
        >
          <div
            ref={wrapperRef}
            className={classNames(
              styles.outerWrapper,
              isFavoritesActive && styles.outerWrapperWithFavorites,
              list.color && globalStyles[`background${upperFirst(camelCase(list.color))}Soft`],
            )}
            onTransitionEnd={handleWrapperTransitionEnd}
          >
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,
                                         jsx-a11y/no-static-element-interactions */}
            <div
              {...dragHandleProps} // eslint-disable-line react/jsx-props-no-spreading
              className={classNames(styles.header, canEdit && styles.headerEditable)}
              onClick={handleHeaderClick}
            >
              {isEditNameOpened ? (
                <EditName listId={id} onClose={handleEditNameClose} />
              ) : (
                <div className={styles.headerName}>
                  {list.color && (
                    <Icon
                      name="circle"
                      className={classNames(
                        styles.headerNameColor,
                        globalStyles[`color${upperFirst(camelCase(list.color))}`],
                      )}
                    />
                  )}
                  {list.name}
                </div>
              )}
              {list.type !== ListTypes.ACTIVE && (
                <Icon
                  name={ListTypeIcons[list.type]}
                  className={classNames(
                    styles.headerIcon,
                    list.isPersisted && (canEdit || canArchiveCards) && styles.headerIconHidable,
                  )}
                />
              )}
              {list.isPersisted &&
                (canEdit ? (
                  <ActionsPopup listId={id} onNameEdit={handleNameEdit} onCardAdd={handleCardAdd}>
                    <Tooltip content={t('common.openListActions')}>
                      <Button className={styles.headerButton}>
                        <Icon fitted name="pencil" size="small" />
                      </Button>
                    </Tooltip>
                  </ActionsPopup>
                ) : (
                  canArchiveCards && (
                    <ArchiveCardsPopup listId={id}>
                      <Tooltip content={t('action.archiveCards')}>
                        <Button className={styles.headerButton}>
                          <Icon fitted name="archive" size="small" />
                        </Button>
                      </Tooltip>
                    </ArchiveCardsPopup>
                  )
                ))}
            </div>
            <div ref={cardsWrapperRef} className={styles.cardsInnerWrapper}>
              <div className={styles.cardsOuterWrapper}>{cardsNode}</div>
            </div>
            {!addCardPosition && canAddCard && (
              <div className={styles.addCardButtonWrapper}>
                <button
                  type="button"
                  disabled={!list.isPersisted}
                  className={classNames(
                    styles.addCardButton,
                    list.color &&
                      globalStyles[`background${upperFirst(camelCase(list.color))}Soft`],
                  )}
                  onClick={handleAddCardClick}
                >
                  {cardCountNode}
                  <PlusMathIcon className={styles.addCardButtonIcon} />
                  <span className={styles.addCardButtonText}>
                    {cardIds.length > 0 ? t('action.addAnotherCard') : t('action.addCard')}
                  </span>
                </button>
                {clipboard && canPasteCard && (
                  <Tooltip content={t('action.paste')}>
                    <button
                      type="button"
                      disabled={!list.isPersisted}
                      className={classNames(styles.addCardButton, styles.paste)}
                      onClick={handlePasteCardClick}
                    >
                      <Icon name="paste" />
                    </button>
                  </Tooltip>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
});

List.propTypes = {
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
};

export default List;
