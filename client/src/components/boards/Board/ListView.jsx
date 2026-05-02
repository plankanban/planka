/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { shallowEqual, useDispatch, useSelector, useStore } from 'react-redux';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from 'react-i18next';
import { Button, Icon, Loader } from 'semantic-ui-react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { BoardMembershipRoles } from '../../../constants/Enums';
import DroppableTypes from '../../../constants/DroppableTypes';
import parseDndId from '../../../utils/parse-dnd-id';
import { closePopup } from '../../../lib/popup';
import globalStyles from '../../../styles.module.scss';
import Card from '../../cards/Card';
import DraggableCard from '../../cards/DraggableCard';
import AddCard from '../../cards/AddCard';
import PlusMathIcon from '../../../assets/images/plus-math-icon.svg?react';

import styles from './ListView.module.scss';

const ListView = React.memo(
  ({
    cardIds,
    isCardsFetching,
    isAllCardsFetched,
    isReorderingEnabled,
    onCardsFetch,
    onCardCreate,
    onCardPaste,
  }) => {
    const store = useStore();
    const dispatch = useDispatch();
    const clipboard = useSelector(selectors.selectClipboard);

    const { canAddCard, canPasteCard } = useSelector((state) => {
      const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
      const isEditor = !!boardMembership && boardMembership.role === BoardMembershipRoles.EDITOR;

      return {
        canAddCard: isEditor,
        canPasteCard: isEditor,
      };
    }, shallowEqual);

    const [t] = useTranslation();
    const [isAddCardOpened, setIsAddCardOpened] = useState(false);

    const [inViewRef] = useInView({
      threshold: 1,
      onChange: (inView) => {
        if (inView && onCardsFetch) {
          onCardsFetch();
        }
      },
    });

    const handleAddCardClick = useCallback(() => {
      setIsAddCardOpened(true);
    }, []);

    const handleAddCardClose = useCallback(() => {
      setIsAddCardOpened(false);
    }, []);

    const handleDragStart = useCallback(() => {
      document.body.classList.add(globalStyles.dragging);
      closePopup();
    }, []);

    const handleDragEnd = useCallback(
      ({ draggableId, type, source, destination }) => {
        document.body.classList.remove(globalStyles.dragging);

        if (!destination || type !== DroppableTypes.CARD) {
          return;
        }

        if (source.index === destination.index) {
          return;
        }

        const cardId = parseDndId(draggableId);
        const state = store.getState();
        const getListId = (id) => {
          const card = id ? selectors.selectCardById(state, id) : null;
          return card ? card.listId : null;
        };

        const newOrder = cardIds.filter((id) => id !== cardId);
        const prevId = destination.index > 0 ? newOrder[destination.index - 1] : null;
        const nextId = destination.index < newOrder.length ? newOrder[destination.index] : null;

        const targetListId = getListId(prevId) || getListId(nextId);
        if (!targetListId) {
          return;
        }

        let localIndex = 0;
        for (let i = 0; i < destination.index; i += 1) {
          if (getListId(newOrder[i]) === targetListId) {
            localIndex += 1;
          }
        }

        dispatch(entryActions.moveCard(cardId, targetListId, localIndex));
      },
      [cardIds, dispatch, store],
    );

    const renderCardsContent = () => {
      if (cardIds.length === 0) {
        return null;
      }

      if (!isReorderingEnabled) {
        return (
          <div className={classNames(styles.segment, styles.cards)}>
            {cardIds.map((cardId, cardIndex) => (
              <div key={cardId} className={styles.card}>
                <Card isInline id={cardId} index={cardIndex} />
              </div>
            ))}
          </div>
        );
      }

      return (
        <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <Droppable droppableId="list-view" type={DroppableTypes.CARD}>
            {({ innerRef, droppableProps, placeholder }) => (
              <div
                {...droppableProps} // eslint-disable-line react/jsx-props-no-spreading
                ref={innerRef}
                className={classNames(styles.segment, styles.cards)}
              >
                {cardIds.map((cardId, cardIndex) => (
                  <DraggableCard
                    key={cardId}
                    isInline
                    id={cardId}
                    index={cardIndex}
                    className={styles.card}
                  />
                ))}
                {placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      );
    };

    return (
      <div className={styles.wrapper}>
        {canAddCard &&
          (onCardCreate && isAddCardOpened ? (
            <div className={styles.segment}>
              <AddCard onCreate={onCardCreate} onClose={handleAddCardClose} />
            </div>
          ) : (
            <div className={styles.addCardButtonWrapper}>
              <Button
                type="button"
                disabled={!onCardCreate}
                className={styles.addCardButton}
                onClick={handleAddCardClick}
              >
                <PlusMathIcon className={styles.addCardButtonIcon} />
                <span className={styles.addCardButtonText}>
                  {onCardCreate ? t('action.addCard') : t('common.atLeastOneListMustBePresent')}
                </span>
              </Button>
              {onCardPaste && clipboard && canPasteCard && (
                <Button
                  type="button"
                  disabled={!onCardCreate}
                  className={classNames(styles.addCardButton, styles.paste)}
                  onClick={onCardPaste}
                >
                  <Icon fitted name="paste" />
                </Button>
              )}
            </div>
          ))}
        {renderCardsContent()}
        {isCardsFetching !== undefined && isAllCardsFetched !== undefined && (
          <div className={styles.loaderWrapper}>
            {isCardsFetching ? (
              <Loader active inverted inline="centered" size="small" />
            ) : (
              !isAllCardsFetched && <div ref={inViewRef} />
            )}
          </div>
        )}
      </div>
    );
  },
);

ListView.propTypes = {
  cardIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isCardsFetching: PropTypes.bool,
  isAllCardsFetched: PropTypes.bool,
  isReorderingEnabled: PropTypes.bool,
  onCardsFetch: PropTypes.func,
  onCardCreate: PropTypes.func,
  onCardPaste: PropTypes.func,
};

ListView.defaultProps = {
  isCardsFetching: undefined,
  isAllCardsFetched: undefined,
  isReorderingEnabled: false,
  onCardsFetch: undefined,
  onCardCreate: undefined,
  onCardPaste: undefined,
};

export default ListView;
