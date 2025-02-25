import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import camelCase from 'lodash/camelCase';
import { useTranslation } from 'react-i18next';
import upperFirst from 'lodash/upperFirst';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { Button, Icon } from 'semantic-ui-react';
import { usePopup } from '../../lib/popup';

import DroppableTypes from '../../constants/DroppableTypes';
import CardContainer from '../../containers/CardContainer';
import CardAdd from './CardAdd';
import NameEdit from './NameEdit';
import ActionsStep from './ActionsStep';
import { ReactComponent as PlusMathIcon } from '../../assets/images/plus-math-icon.svg';

import styles from './List.module.scss';
import globalStyles from '../../styles.module.scss';

const List = React.memo(
  ({
    id,
    index,
    name,
    color,
    isPersisted,
    cardIds,
    canEdit,
    onUpdate,
    onDelete,
    onSort,
    onCardCreate,
  }) => {
    const [t] = useTranslation();
    const [isAddCardOpened, setIsAddCardOpened] = useState(false);

    const nameEdit = useRef(null);
    const cardsWrapper = useRef(null);

    const handleHeaderClick = useCallback(() => {
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

    const handleColorEdit = useCallback(
      (newColor) => {
        onUpdate({
          color: newColor,
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
        cardsWrapper.current.scrollTop = cardsWrapper.current.scrollHeight;
      }
    }, [cardIds, isAddCardOpened]);

    const ActionsPopup = usePopup(ActionsStep);

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
              {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,
                                           jsx-a11y/no-static-element-interactions */}
              <div
                {...dragHandleProps} // eslint-disable-line react/jsx-props-no-spreading
                className={classNames(styles.header, canEdit && styles.headerEditable)}
                onClick={handleHeaderClick}
              >
                <NameEdit ref={nameEdit} defaultValue={name} onUpdate={handleNameUpdate}>
                  <div className={styles.headerName}>
                    {color && (
                      <Icon
                        name="circle"
                        className={classNames(
                          styles.headerNameColor,
                          globalStyles[`color${upperFirst(camelCase(color))}`],
                        )}
                      />
                    )}
                    {name}
                  </div>
                </NameEdit>
                {isPersisted && canEdit && (
                  <ActionsPopup
                    onNameEdit={handleNameEdit}
                    onCardAdd={handleCardAdd}
                    onDelete={onDelete}
                    onSort={onSort}
                    color={color}
                    onColorEdit={handleColorEdit}
                  >
                    <Button className={classNames(styles.headerButton, styles.target)}>
                      <Icon fitted name="pencil" size="small" />
                    </Button>
                  </ActionsPopup>
                )}
              </div>
              <div ref={cardsWrapper} className={styles.cardsInnerWrapper}>
                <div className={styles.cardsOuterWrapper}>{cardsNode}</div>
              </div>
              {!isAddCardOpened && canEdit && (
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
  color: PropTypes.string,
  isPersisted: PropTypes.bool.isRequired,
  cardIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  canEdit: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onSort: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onCardCreate: PropTypes.func.isRequired,
};

List.defaultProps = {
  color: undefined,
};

export default List;
