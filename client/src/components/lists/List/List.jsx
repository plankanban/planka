/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { Button, Icon } from 'semantic-ui-react';
import { useDidUpdate, useTransitioning } from '../../../lib/hooks';
import { usePopup } from '../../../lib/popup';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
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

const List = React.memo(({ id, index }) => {
  const selectListById = useMemo(() => selectors.makeSelectListById(), []);

  const selectFilteredCardIdsByListId = useMemo(
    () => selectors.makeSelectFilteredCardIdsByListId(),
    [],
  );

  const isFavoritesActive = useSelector(selectors.selectIsFavoritesActiveForCurrentUser);
  const list = useSelector((state) => selectListById(state, id));
  const cardIds = useSelector((state) => selectFilteredCardIdsByListId(state, id));

  const { canEdit, canArchiveCards, canAddCard, canDropCard } = useSelector((state) => {
    const isEditModeEnabled = selectors.selectIsEditModeEnabled(state); // TODO: move out?

    const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
    const isEditor = !!boardMembership && boardMembership.role === BoardMembershipRoles.EDITOR;

    return {
      canEdit: isEditModeEnabled && isEditor,
      canArchiveCards: list.type === ListTypes.CLOSED && isEditor,
      canAddCard: isEditor,
      canDropCard: isEditor,
    };
  }, shallowEqual);

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [isEditNameOpened, setIsEditNameOpened] = useState(false);
  const [isAddCardOpened, setIsAddCardOpened] = useState(false);

  const wrapperRef = useRef(null);
  const cardsWrapperRef = useRef(null);

  const handleCardCreate = useCallback(
    (data, autoOpen) => {
      dispatch(entryActions.createCard(id, data, autoOpen));
    },
    [id, dispatch],
  );

  const handleHeaderClick = useCallback(() => {
    if (list.isPersisted && canEdit) {
      setIsEditNameOpened(true);
    }
  }, [list.isPersisted, canEdit]);

  const handleAddCardClick = useCallback(() => {
    setIsAddCardOpened(true);
  }, []);

  const handleAddCardClose = useCallback(() => {
    setIsAddCardOpened(false);
  }, []);

  const handleCardAdd = useCallback(() => {
    setIsAddCardOpened(true);
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
    if (isAddCardOpened) {
      cardsWrapperRef.current.scrollTop = cardsWrapperRef.current.scrollHeight;
    }
  }, [cardIds, isAddCardOpened]);

  const ActionsPopup = usePopup(ActionsStep);
  const ArchiveCardsPopup = usePopup(ArchiveCardsStep);

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
            {cardIds.map((cardId, cardIndex) => (
              <DraggableCard key={cardId} id={cardId} index={cardIndex} className={styles.card} />
            ))}
            {placeholder}
            {canAddCard && (
              <AddCard
                isOpened={isAddCardOpened}
                className={styles.addCard}
                onCreate={handleCardCreate}
                onClose={handleAddCardClose}
              />
            )}
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
        >
          <div
            ref={wrapperRef}
            className={classNames(
              styles.outerWrapper,
              isFavoritesActive && styles.outerWrapperWithFavorites,
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
                    <Button className={styles.headerButton}>
                      <Icon fitted name="pencil" size="small" />
                    </Button>
                  </ActionsPopup>
                ) : (
                  canArchiveCards && (
                    <ArchiveCardsPopup listId={id}>
                      <Button className={styles.headerButton}>
                        <Icon fitted name="archive" size="small" />
                      </Button>
                    </ArchiveCardsPopup>
                  )
                ))}
            </div>
            <div ref={cardsWrapperRef} className={styles.cardsInnerWrapper}>
              <div className={styles.cardsOuterWrapper}>{cardsNode}</div>
            </div>
            {!isAddCardOpened && canAddCard && (
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
