import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { closePopup } from '../../lib/popup';

import DroppableTypes from '../../constants/DroppableTypes';
import ListContainer from '../../containers/ListContainer';
import CardModalContainer from '../../containers/CardModalContainer';
import AddList from './AddList';
import Filter from './Filter';
import { ReactComponent as PlusMathIcon } from '../../assets/images/plus-math-icon.svg';

import styles from './Board.module.css';

const parseDndId = (dndId) => dndId.split(':')[1];

const Board = React.memo(
  ({
    listIds,
    filterUsers,
    filterLabels,
    allProjectMemberships,
    allLabels,
    isCardModalOpened,
    onListCreate,
    onListMove,
    onCardMove,
    onUserToFilterAdd,
    onUserFromFilterRemove,
    onLabelToFilterAdd,
    onLabelFromFilterRemove,
    onLabelCreate,
    onLabelUpdate,
    onLabelDelete,
  }) => {
    const [t] = useTranslation();
    const [isAddListOpened, setIsAddListOpened] = useState(false);

    const wrapper = useRef(null);
    const prevPosition = useRef(null);

    const handleAddListClick = useCallback(() => {
      setIsAddListOpened(true);
    }, []);

    const handleAddListClose = useCallback(() => {
      setIsAddListOpened(false);
    }, []);

    const handleDragStart = useCallback(() => {
      closePopup();
    }, []);

    const handleDragEnd = useCallback(
      ({ draggableId, type, source, destination }) => {
        if (
          !destination ||
          (source.droppableId === destination.droppableId && source.index === destination.index)
        ) {
          return;
        }

        const id = parseDndId(draggableId);

        switch (type) {
          case DroppableTypes.LIST:
            onListMove(id, destination.index);

            break;
          case DroppableTypes.CARD:
            onCardMove(id, parseDndId(destination.droppableId), destination.index);

            break;
          default:
        }
      },
      [onListMove, onCardMove],
    );

    const handleMouseDown = useCallback(
      (event) => {
        if (event.target !== wrapper.current && !event.target.dataset.dragScroller) {
          return;
        }

        prevPosition.current = event.clientX;
      },
      [wrapper],
    );

    const handleWindowMouseMove = useCallback(
      (event) => {
        if (!prevPosition.current) {
          return;
        }

        event.preventDefault();

        window.scrollBy({
          left: prevPosition.current - event.clientX,
        });

        prevPosition.current = event.clientX;
      },
      [prevPosition],
    );

    const handleWindowMouseUp = useCallback(() => {
      prevPosition.current = null;
    }, [prevPosition]);

    useEffect(() => {
      if (isAddListOpened) {
        window.scroll(document.body.scrollWidth, 0);
      }
    }, [listIds, isAddListOpened]);

    useEffect(() => {
      window.addEventListener('mouseup', handleWindowMouseUp);
      window.addEventListener('mousemove', handleWindowMouseMove);

      return () => {
        window.removeEventListener('mouseup', handleWindowMouseUp);
        window.removeEventListener('mousemove', handleWindowMouseMove);
      };
    }, [handleWindowMouseUp, handleWindowMouseMove]);

    return (
      <>
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
        <div ref={wrapper} className={styles.wrapper} onMouseDown={handleMouseDown}>
          <Filter
            users={filterUsers}
            labels={filterLabels}
            allProjectMemberships={allProjectMemberships}
            allLabels={allLabels}
            onUserAdd={onUserToFilterAdd}
            onUserRemove={onUserFromFilterRemove}
            onLabelAdd={onLabelToFilterAdd}
            onLabelRemove={onLabelFromFilterRemove}
            onLabelCreate={onLabelCreate}
            onLabelUpdate={onLabelUpdate}
            onLabelDelete={onLabelDelete}
          />
          <div>
            <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <Droppable droppableId="board" type={DroppableTypes.LIST} direction="horizontal">
                {({ innerRef, droppableProps, placeholder }) => (
                  <div
                    {...droppableProps} // eslint-disable-line react/jsx-props-no-spreading
                    data-drag-scroller
                    ref={innerRef}
                    className={styles.lists}
                  >
                    {listIds.map((listId, index) => (
                      <ListContainer key={listId} id={listId} index={index} />
                    ))}
                    {placeholder}
                    <div data-drag-scroller className={styles.list}>
                      {isAddListOpened ? (
                        <AddList
                          isOpened={isAddListOpened}
                          onCreate={onListCreate}
                          onClose={handleAddListClose}
                        />
                      ) : (
                        <button
                          type="button"
                          className={styles.addListButton}
                          onClick={handleAddListClick}
                        >
                          <PlusMathIcon className={styles.addListButtonIcon} />
                          <span className={styles.addListButtonText}>
                            {listIds.length > 0 ? t('action.addAnotherList') : t('action.addList')}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
        {isCardModalOpened && <CardModalContainer />}
      </>
    );
  },
);

Board.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  listIds: PropTypes.array.isRequired,
  filterUsers: PropTypes.array.isRequired,
  filterLabels: PropTypes.array.isRequired,
  allProjectMemberships: PropTypes.array.isRequired,
  allLabels: PropTypes.array.isRequired,
  /* eslint-enable react/forbid-prop-types */
  isCardModalOpened: PropTypes.bool.isRequired,
  onListCreate: PropTypes.func.isRequired,
  onListMove: PropTypes.func.isRequired,
  onCardMove: PropTypes.func.isRequired,
  onUserToFilterAdd: PropTypes.func.isRequired,
  onUserFromFilterRemove: PropTypes.func.isRequired,
  onLabelToFilterAdd: PropTypes.func.isRequired,
  onLabelFromFilterRemove: PropTypes.func.isRequired,
  onLabelCreate: PropTypes.func.isRequired,
  onLabelUpdate: PropTypes.func.isRequired,
  onLabelDelete: PropTypes.func.isRequired,
};

export default Board;
