import pick from 'lodash/pick';
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation, Trans } from 'react-i18next';
import { Link } from 'react-router-dom';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Button, Icon } from 'semantic-ui-react';
import { closePopup } from '../../lib/popup';
import { DragScroller } from '../../lib/custom-ui';

import Paths from '../../constants/Paths';
import DroppableTypes from '../../constants/DroppableTypes';
import BoardWrapperContainer from '../../containers/BoardWrapperContainer';
import AddPopup from './AddPopup';
import EditPopup from './EditPopup';

import styles from './Boards.module.css';

const Boards = React.memo(
  ({
    items, currentId, isEditable, onCreate, onUpdate, onMove, onDelete,
  }) => {
    const [t] = useTranslation();

    const handleDragStart = useCallback(() => {
      closePopup();
    }, []);

    const handleDragEnd = useCallback(
      ({ draggableId, source, destination }) => {
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

    const renderItems = useCallback(
      (safeItems) => safeItems.map((item) => (
        <div key={item.id} className={styles.tabWrapper}>
          <div className={classNames(styles.tab, item.id === currentId && styles.tabActive)}>
            {item.isPersisted ? (
              <Link
                to={Paths.BOARDS.replace(':id', item.id)}
                title={item.name}
                className={styles.link}
              >
                {item.name}
              </Link>
            ) : (
              <span className={styles.link}>{item.name}</span>
            )}
          </div>
        </div>
      )),
      [currentId],
    );

    const renderEditableItems = useCallback(
      (safeItems) => safeItems.map((item, index) => (
        <Draggable
          key={item.id}
          draggableId={item.id}
          index={index}
          isDragDisabled={!item.isPersisted}
        >
          {({ innerRef, draggableProps, dragHandleProps }) => (
            // eslint-disable-next-line react/jsx-props-no-spreading
            <div {...draggableProps} ref={innerRef} className={styles.tabWrapper}>
              <div className={classNames(styles.tab, item.id === currentId && styles.tabActive)}>
                {item.isPersisted ? (
                  <Link
                    {...dragHandleProps} // eslint-disable-line react/jsx-props-no-spreading
                    to={Paths.BOARDS.replace(':id', item.id)}
                    title={item.name}
                    className={styles.link}
                  >
                    {item.name}
                  </Link>
                ) : (
                // eslint-disable-next-line react/jsx-props-no-spreading
                  <span {...dragHandleProps} className={styles.link}>
                    {item.name}
                  </span>
                )}
                {item.isPersisted && (
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
              </div>
            </div>
          )}
        </Draggable>
      )),
      [currentId, handleUpdate, handleDelete],
    );

    return (
      <div className={styles.wrapper}>
        {isEditable ? (
          <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <Droppable droppableId="boards" type={DroppableTypes.BOARD} direction="horizontal">
              {({ innerRef, droppableProps, placeholder }) => (
                // eslint-disable-next-line react/jsx-props-no-spreading
                <div {...droppableProps} ref={innerRef} className={styles.tabs}>
                  {renderEditableItems(items)}
                  {placeholder}
                  <AddPopup onCreate={onCreate}>
                    <Button icon="plus" className={styles.addButton} />
                  </AddPopup>
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <div className={styles.tabs}>{renderItems(items)}</div>
        )}
        <DragScroller className={styles.board}>
          {currentId ? (
            <BoardWrapperContainer />
          ) : (
            <div className={styles.message}>
              <Icon
                inverted
                name="hand point up outline"
                size="huge"
                className={styles.messageIcon}
              />
              <h1 className={styles.messageTitle}>
                {t('common.openBoard', {
                  context: 'title',
                })}
              </h1>
              <div className={styles.messageContent}>
                <Trans i18nKey="common.createNewOneOrSelectExistingOne" />
              </div>
            </div>
          )}
        </DragScroller>
      </div>
    );
  },
);

Boards.propTypes = {
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  currentId: PropTypes.number,
  isEditable: PropTypes.bool.isRequired,
  onCreate: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onMove: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

Boards.defaultProps = {
  currentId: undefined,
};

export default Boards;
