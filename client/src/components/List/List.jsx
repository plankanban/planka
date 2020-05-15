import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { Button, Icon } from 'semantic-ui-react';

import DroppableTypes from '../../constants/DroppableTypes';
import CardContainer from '../../containers/CardContainer';
import EditName from './EditName';
import AddCard from './AddCard';
import ActionsPopup from './ActionsPopup';
import { ReactComponent as PlusMathIcon } from '../../assets/images/plus-math-icon.svg';

import styles from './List.module.css';

const List = React.memo(
  ({ id, index, name, isPersisted, cardIds, onUpdate, onDelete, onCardCreate }) => {
    const [t] = useTranslation();
    const [isAddCardOpened, setIsAddCardOpened] = useState(false);

    const editName = useRef(null);
    const listWrapper = useRef(null);

    const handleHeaderClick = useCallback(() => {
      if (isPersisted) {
        editName.current.open();
      }
    }, [isPersisted]);

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
      editName.current.open();
    }, []);

    const handleCardAdd = useCallback(() => {
      setIsAddCardOpened(true);
    }, []);

    useEffect(() => {
      if (isAddCardOpened) {
        listWrapper.current.scrollTop = listWrapper.current.scrollHeight;
      }
    }, [cardIds, isAddCardOpened]);

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
              {cardIds.map((cardId, cardIndex) => (
                <CardContainer key={cardId} id={cardId} index={cardIndex} />
              ))}
              {placeholder}
              <AddCard
                isOpened={isAddCardOpened}
                onCreate={onCardCreate}
                onClose={handleAddCardClose}
              />
            </div>
          </div>
        )}
      </Droppable>
    );

    return (
      <Draggable draggableId={`list:${id}`} index={index} isDragDisabled={!isPersisted}>
        {({ innerRef, draggableProps, dragHandleProps }) => (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <div {...draggableProps} data-drag-scroller ref={innerRef} className={styles.wrapper}>
            {/* eslint-disable jsx-a11y/click-events-have-key-events,
                               jsx-a11y/no-static-element-interactions,
                               react/jsx-props-no-spreading */}
            <div {...dragHandleProps} className={styles.header} onClick={handleHeaderClick}>
              {/* eslint-enable jsx-a11y/click-events-have-key-events,
                                jsx-a11y/no-static-element-interactions,
                                react/jsx-props-no-spreading */}
              <EditName ref={editName} defaultValue={name} onUpdate={handleNameUpdate}>
                <div className={styles.headerName}>{name}</div>
              </EditName>
              {isPersisted && (
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
            </div>
            <div
              ref={listWrapper}
              className={classNames(styles.listWrapper, isAddCardOpened && styles.listWrapperFull)}
            >
              <div className={styles.list}>{cardsNode}</div>
            </div>
            {!isAddCardOpened && (
              <button
                type="button"
                disabled={!isPersisted}
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
        )}
      </Draggable>
    );
  },
);

List.propTypes = {
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  isPersisted: PropTypes.bool.isRequired,
  cardIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  onCardCreate: PropTypes.func.isRequired,
};

List.defaultProps = {
  onDelete: undefined,
};

export default List;
