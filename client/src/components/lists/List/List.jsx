/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { Button, Icon } from 'semantic-ui-react';
import { useDidUpdate, useToggle, useTransitioning } from '../../../lib/hooks';
import { usePopup } from '../../../lib/popup';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { BoardShortcutsContext } from '../../../contexts';
import DroppableTypes from '../../../constants/DroppableTypes';
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

  const clipboard = useSelector(selectors.selectClipboard);
  const isFavoritesActive = useSelector(selectors.selectIsFavoritesActiveForCurrentUser);

  const list = useSelector((state) => selectListById(state, id));
  const cardIds = useSelector((state) => selectFilteredCardIdsByListId(state, id));

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
  const collapsedStorageKey = list?.boardId != null && list?.id != null
    ? `planka-list-collapsed-${list.boardId}-${list.id}`
    : null;
  const [collapsed, setCollapsed] = useState(false);
  const hasReadCollapsedRef = useRef(false);

  useEffect(() => {
    if (collapsedStorageKey == null || hasReadCollapsedRef.current) return;
    hasReadCollapsedRef.current = true;
    try {
      const stored = localStorage.getItem(collapsedStorageKey);
      if (stored === 'true') setCollapsed(true);
    } catch (_) { /* ignore */ }
  }, [collapsedStorageKey]);

  const toggleCollapsed = useCallback(() => {
    if (collapsedStorageKey == null) return;
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(collapsedStorageKey, String(next));
      } catch (_) { /* ignore */ }
      return next;
    });
  }, [collapsedStorageKey]);

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

  const handleMouseEnter = useCallback(() => {
    handleListMouseEnter(id, () => {
      scrollBottom();
    });
  }, [id, scrollBottom, handleListMouseEnter]);

  const handleHeaderClick = useCallback(() => {
    if (list.isPersisted && canEdit && !isEditNameOpened) {
      setIsEditNameOpened(true);
    }
  }, [list.isPersisted, canEdit, isEditNameOpened]);

  const handleCollapseClick = useCallback(
    (e) => {
      e.stopPropagation();
      e.preventDefault();
      toggleCollapsed();
    },
    [toggleCollapsed],
  );

  const handleAddCardClick = useCallback(() => {
    setAddCardPosition(AddCardPositions.BOTTOM);
  }, []);

  const handleAddCardClose = useCallback(() => {
    setAddCardPosition(null);
  }, []);

  const handleCardAdd = useCallback(() => {
    setAddCardPosition(AddCardPositions.TOP);
  }, []);

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
      isDropDisabled={!list.isPersisted || !canDropCard || collapsed}
    >
      {({ innerRef, droppableProps, placeholder }) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <div {...droppableProps} ref={innerRef}>
          {collapsed ? (
            <div className={styles.cards} style={{ minHeight: 0 }} aria-hidden="true" />
          ) : (
            <div
              className={styles.cards}
              style={cardIds.length === 0 ? { minHeight: 60 } : undefined}
            >
              {addCardPosition === AddCardPositions.TOP && addCardNode}
              {cardIds.map((cardId, cardIndex) => (
                <DraggableCard key={cardId} id={cardId} index={cardIndex} className={styles.card} />
              ))}
              {placeholder}
              {addCardPosition === AddCardPositions.BOTTOM && addCardNode}
              {!addCardPosition && canAddCard && (
                <div className={styles.addCardButtonWrapper}>
                  <button
                    type="button"
                    disabled={!list.isPersisted}
                    className={styles.addCardButton}
                    onClick={handleAddCardClick}
                  >
                    <PlusMathIcon className={styles.addCardButtonIcon} />
                    <span className={styles.addCardButtonText}>
                      {cardIds.length > 0 ? t('action.addAnotherCard') : t('action.addCard')}
                    </span>
                  </button>
                  {clipboard && canPasteCard && (
                    <button
                      type="button"
                      disabled={!list.isPersisted}
                      className={classNames(styles.addCardButton, styles.paste)}
                      onClick={handlePasteCardClick}
                    >
                      <Icon name="paste" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
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
          style={
            collapsed
              ? {
                  width: 36,
                  minWidth: 36,
                  flexShrink: 0,
                  minHeight: 480,
                  height: '70vh',
                  alignSelf: 'stretch',
                }
              : undefined
          }
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleListMouseLeave}
        >
          <div
            ref={wrapperRef}
            className={classNames(
              styles.outerWrapper,
              isFavoritesActive && styles.outerWrapperWithFavorites,
              collapsed && styles.outerWrapperCollapsed,
            )}
            style={
              collapsed
                ? { flexDirection: 'column', minHeight: '100%', flex: 1, display: 'flex' }
                : undefined
            }
            onTransitionEnd={handleWrapperTransitionEnd}
          >
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,
                                         jsx-a11y/no-static-element-interactions */}
            <div
              {...dragHandleProps} // eslint-disable-line react/jsx-props-no-spreading
              className={classNames(
                styles.header,
                canEdit && styles.headerEditable,
                collapsed && styles.headerCollapsed,
              )}
              style={
                collapsed
                  ? { flex: 1, minHeight: 0, padding: 0, overflow: 'visible' }
                  : {
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      flex: 1,
                      minWidth: 0,
                    }
              }
              onClick={handleHeaderClick}
            >
              {collapsed ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    minHeight: 0,
                    width: '100%',
                    alignItems: 'center',
                    overflow: 'visible',
                  }}
                >
                  <button
                    type="button"
                    className={styles.headerCollapseButton}
                    onClick={handleCollapseClick}
                    onMouseDown={(e) => e.stopPropagation()}
                    title="Expand list"
                    aria-expanded={false}
                    aria-label="Expand list"
                    style={{ flexShrink: 0, padding: '2px 0' }}
                  >
                    <Icon name="chevron down" className={styles.headerCollapseIcon} />
                  </button>
                  <div
                    style={{
                      flex: 1,
                      minHeight: 80,
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'center',
                      paddingTop: 6,
                      paddingBottom: 6,
                      paddingLeft: 0,
                      paddingRight: 0,
                      overflow: 'visible',
                      width: '100%',
                    }}
                  >
                    {!isEditNameOpened && (
                      <div
                        className={styles.headerName}
                        style={{
                          flex: 1,
                          minHeight: 80,
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                        }}
                      >
                        <span
                          style={{
                            writingMode: 'vertical-rl',
                            textOrientation: 'mixed',
                            whiteSpace: 'nowrap',
                            fontSize: 'inherit',
                            lineHeight: 1.3,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: 'block',
                            maxHeight: '100%',
                          }}
                        >
                          {list.color && (
                            <Icon
                              name="circle"
                              className={classNames(
                                styles.headerNameColor,
                                globalStyles[`color${upperFirst(camelCase(list.color))}`],
                              )}
                            />
                          )}
                          {' '}
                          {list.name}
                          {cardIds.length > 0 ? ` (${cardIds.length})` : ''}
                        </span>
                      </div>
                    )}
                    {isEditNameOpened && <EditName listId={id} onClose={handleEditNameClose} />}
                  </div>
                </div>
              ) : (
                <>
                  <div
                    style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}
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
                        {cardIds.length > 0 && (
                          <span className={styles.headerCardCount}>
                            {' '}
                            (
                            {cardIds.length}
                            )
                          </span>
                        )}
                      </div>
                    )}
                  </div>
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
                      <span onClick={(e) => e.stopPropagation()} role="presentation">
                        <ActionsPopup
                          listId={id}
                          onNameEdit={handleNameEdit}
                          onCardAdd={handleCardAdd}
                        >
                          <Button className={styles.headerButton}>
                            <Icon fitted name="pencil" size="small" />
                          </Button>
                        </ActionsPopup>
                      </span>
                    ) : (
                      canArchiveCards && (
                        <span onClick={(e) => e.stopPropagation()} role="presentation">
                          <ArchiveCardsPopup listId={id}>
                            <Button className={styles.headerButton}>
                              <Icon fitted name="archive" size="small" />
                            </Button>
                          </ArchiveCardsPopup>
                        </span>
                      )
                    ))}
                  <button
                    type="button"
                    className={styles.headerCollapseButton}
                    onClick={handleCollapseClick}
                    onMouseDown={(e) => e.stopPropagation()}
                    title="Collapse list"
                    aria-expanded
                    aria-label="Collapse list"
                    style={{ flexShrink: 0, alignSelf: 'flex-start' }}
                  >
                    <Icon name="chevron right" className={styles.headerCollapseIcon} />
                  </button>
                </>
              )}
            </div>
            <div
              ref={cardsWrapperRef}
              className={styles.cardsInnerWrapper}
              style={collapsed ? { display: 'none' } : undefined}
            >
              <div className={styles.cardsOuterWrapper}>{cardsNode}</div>
            </div>
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
