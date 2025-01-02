import pick from 'lodash/pick';
import React, { useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Button, Icon } from 'semantic-ui-react';
import { closePopup, usePopup } from '../../lib/popup';

import Paths from '../../constants/Paths';
import DroppableTypes from '../../constants/DroppableTypes';
import AddStep from './AddStep';
import EditStep from './EditStep';

import styles from './Boards.module.scss';
import globalStyles from '../../styles.module.scss';

const Boards = React.memo(({ items, currentId, canEdit, onCreate, onUpdate, onMove, onDelete }) => {
  const tabsWrapper = useRef(null);

  const handleWheel = useCallback(({ deltaY }) => {
    tabsWrapper.current.scrollBy({
      left: deltaY,
    });
  }, []);

  const handleDragStart = useCallback(() => {
    document.body.classList.add(globalStyles.dragging);
    closePopup();
  }, []);

  const handleDragEnd = useCallback(
    ({ draggableId, source, destination }) => {
      document.body.classList.remove(globalStyles.dragging);

      if (!destination || source.index === destination.index) {
        return;
      }

      onMove(draggableId, destination.index);
    },
    [onMove],
  );

  const handleUpdate = useCallback(
    (id, data) => {
      onUpdate(id, data);
    },
    [onUpdate],
  );

  const handleDelete = useCallback(
    (id) => {
      onDelete(id);
    },
    [onDelete],
  );

  const AddPopup = usePopup(AddStep);
  const EditPopup = usePopup(EditStep);

  const itemsNode = items.map((item, index) => (
    <Draggable
      key={item.id}
      draggableId={item.id}
      index={index}
      isDragDisabled={!item.isPersisted || !canEdit}
    >
      {({ innerRef, draggableProps, dragHandleProps }) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <div {...draggableProps} ref={innerRef} className={styles.tabWrapper}>
          <div className={classNames(styles.tab, item.id === currentId && styles.tabActive)}>
            {item.isPersisted ? (
              <>
                <Link
                  {...dragHandleProps} // eslint-disable-line react/jsx-props-no-spreading
                  to={Paths.BOARDS.replace(':id', item.id)}
                  title={item.name}
                  className={styles.link}
                >
                  {item.name}
                </Link>
                {canEdit && (
                  <EditPopup
                    defaultData={pick(item, 'name')}
                    onUpdate={(data) => handleUpdate(item.id, data)}
                    onDelete={() => handleDelete(item.id)}
                  >
                    <Button className={classNames(styles.editButton, styles.target)}>
                      <Icon fitted name="pencil" size="small" />
                    </Button>
                  </EditPopup>
                )}
              </>
            ) : (
              // eslint-disable-next-line react/jsx-props-no-spreading
              <span {...dragHandleProps} className={styles.link}>
                {item.name}
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  ));

  return (
    <div className={styles.wrapper} onWheel={handleWheel}>
      <div ref={tabsWrapper} className={styles.tabsWrapper}>
        <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <Droppable droppableId="boards" type={DroppableTypes.BOARD} direction="horizontal">
            {({ innerRef, droppableProps, placeholder }) => (
              // eslint-disable-next-line react/jsx-props-no-spreading
              <div {...droppableProps} ref={innerRef} className={styles.tabs}>
                {itemsNode}
                {placeholder}
                {canEdit && (
                  <AddPopup onCreate={onCreate}>
                    <Button icon="plus" className={styles.addButton} />
                  </AddPopup>
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
});

Boards.propTypes = {
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  currentId: PropTypes.string,
  canEdit: PropTypes.bool.isRequired,
  onCreate: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onMove: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

Boards.defaultProps = {
  currentId: undefined,
};

export default Boards;
