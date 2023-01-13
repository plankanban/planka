import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { Button, Icon } from 'semantic-ui-react';

import DroppableTypes from '../../constants/DroppableTypes';
import CardContainer from '../../containers/CardContainer';
import NameEdit from './NameEdit';
import CardAdd from './CardAdd';
import ActionsPopup from './ActionsPopup';
import { ReactComponent as PlusMathIcon } from '../../assets/images/plus-math-icon.svg';

import styles from './List.module.scss';

const List = React.memo(
  // eslint-disable-next-line prettier/prettier
  ({ id, index, name, isPersisted, isCollapsed, cardIds, isFiltered, filteredCardIds, canEdit, onUpdate, onDelete, onCardCreate }) => {
    const [t] = useTranslation();
    const [isAddCardOpened, setIsAddCardOpened] = useState(false);

    const nameEdit = useRef(null);
    const listWrapper = useRef(null);

    const handleToggleCollapseClick = useCallback(() => {
      if (isPersisted && canEdit) {
        onUpdate({
          isCollapsed: !isCollapsed,
        });
      }
    }, [isPersisted, canEdit, onUpdate, isCollapsed]);

    const handleHeaderNameClick = useCallback(() => {
      if (isPersisted && canEdit) {
        nameEdit.current.open();
      }
    }, [isPersisted, canEdit]);

    const handleNameUpdate = useCallback(
      (newName) => {
        onUpdate({
          name: newName,
        });
      },
      [onUpdate],
    );

    const handleAddCardClick = useCallback(() => {
      setIsAddCardOpened(true);
    }, []);

    const handleAddCardClose = useCallback(() => {
      setIsAddCardOpened(false);
    }, []);

    const handleNameEdit = useCallback(() => {
      nameEdit.current.open();
    }, []);

    const handleCardAdd = useCallback(() => {
      setIsAddCardOpened(true);
    }, []);

    useEffect(() => {
      if (isAddCardOpened) {
        listWrapper.current.scrollTop = listWrapper.current.scrollHeight;
      }
    }, [filteredCardIds, isAddCardOpened]);

    const cardsNode = (
      <Droppable
        droppableId={`list:${id}`}
        type={DroppableTypes.CARD}
        isDropDisabled={!isPersisted}
      >
        {({ innerRef, droppableProps, placeholder }) => (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <div {...droppableProps} ref={innerRef}>
            <div className={styles.cards}>
              {filteredCardIds.map((cardId, cardIndex) => (
                <CardContainer key={cardId} id={cardId} index={cardIndex} />
              ))}
              {placeholder}
              {canEdit && (
                <CardAdd
                  isOpened={isAddCardOpened}
                  onCreate={onCardCreate}
                  onClose={handleAddCardClose}
                />
              )}
            </div>
          </div>
        )}
      </Droppable>
    );

    const cardsCountText = () => {
      return (
        [
          isFiltered
            ? `${filteredCardIds.length} ${t('common.of')} ${cardIds.length} `
            : `${cardIds.length} `,
        ] + [cardIds.length !== 1 ? t('common.cards') : t('common.card')]
      );
    };

    if (isCollapsed) {
      return (
        <Draggable
          draggableId={`list:${id}`}
          index={index}
          isDragDisabled={!isPersisted || !canEdit}
        >
          {({ innerRef, draggableProps, dragHandleProps }) => (
            <div
              {...draggableProps} // eslint-disable-line react/jsx-props-no-spreading
              data-drag-scroller
              ref={innerRef}
              className={styles.innerWrapperCollapsed}
            >
              <div className={styles.outerWrapper}>
                <div
                  {...dragHandleProps} // eslint-disable-line react/jsx-props-no-spreading
                  className={styles.headerCollapsed}
                >
                  {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,
                                         jsx-a11y/no-static-element-interactions */}
                  <div
                    className={classNames(
                      styles.headerCollapseButtonCollapsed,
                      canEdit && styles.headerEditable,
                    )}
                    onClick={handleToggleCollapseClick}
                  >
                    <Icon fitted name="triangle down" />
                  </div>
                  <div className={styles.headerNameCollapsed}>{name}</div>
                  <div className={styles.headerCardsCountCollapsed}>{cardsCountText()}</div>
                </div>
              </div>
            </div>
          )}
        </Draggable>
      );
    }
    return (
      <Draggable draggableId={`list:${id}`} index={index} isDragDisabled={!isPersisted || !canEdit}>
        {({ innerRef, draggableProps, dragHandleProps }) => (
          <div
            {...draggableProps} // eslint-disable-line react/jsx-props-no-spreading
            data-drag-scroller
            ref={innerRef}
            className={styles.innerWrapper}
          >
            <div className={styles.outerWrapper}>
              <div
                {...dragHandleProps} // eslint-disable-line react/jsx-props-no-spreading
                className={styles.header}
              >
                {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,
                                           jsx-a11y/no-static-element-interactions */}
                <div
                  className={classNames(
                    styles.headerCollapseButton,
                    canEdit && styles.headerEditable,
                  )}
                  onClick={handleToggleCollapseClick}
                >
                  <Icon fitted name="triangle right" />
                </div>
                <NameEdit ref={nameEdit} defaultValue={name} onUpdate={handleNameUpdate}>
                  {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,
                                           jsx-a11y/no-static-element-interactions */}
                  <div
                    className={classNames(styles.headerName, canEdit && styles.headerEditable)}
                    onClick={handleHeaderNameClick}
                  >
                    {name}
                  </div>
                </NameEdit>
                {isPersisted && canEdit && (
                  <ActionsPopup
                    onNameEdit={handleNameEdit}
                    onCardAdd={handleCardAdd}
                    onDelete={onDelete}
                  >
                    <Button className={classNames(styles.headerButton, styles.target)}>
                      <Icon fitted name="pencil" size="small" />
                    </Button>
                  </ActionsPopup>
                )}
                <div className={styles.headerCardsCount}>{cardsCountText()}</div>
              </div>
              <div
                ref={listWrapper}
                className={classNames(
                  styles.cardsInnerWrapper,
                  (isAddCardOpened || !canEdit) && styles.cardsInnerWrapperFull,
                )}
              >
                <div className={styles.cardsOuterWrapper}>{cardsNode}</div>
              </div>
              {!isAddCardOpened && canEdit && (
                <button
                  type="button"
                  disabled={!isPersisted}
                  className={classNames(styles.addCardButton)}
                  onClick={handleAddCardClick}
                >
                  <PlusMathIcon className={styles.addCardButtonIcon} />
                  <span className={styles.addCardButtonText}>
                    {filteredCardIds.length > 0 ? t('action.addAnotherCard') : t('action.addCard')}
                  </span>
                </button>
              )}
            </div>
          </div>
        )}
      </Draggable>
    );
  },
);

List.propTypes = {
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  isCollapsed: PropTypes.bool.isRequired,
  isPersisted: PropTypes.bool.isRequired,
  cardIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isFiltered: PropTypes.bool.isRequired,
  filteredCardIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  canEdit: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onCardCreate: PropTypes.func.isRequired,
};

export default List;
