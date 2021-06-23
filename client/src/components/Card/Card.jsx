import React, { useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Button, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { Draggable } from 'react-beautiful-dnd';

import Paths from '../../constants/Paths';
import Tasks from './Tasks';
import NameEdit from './NameEdit';
import ActionsPopup from './ActionsPopup';
import User from '../User';
import Label from '../Label';
import DueDate from '../DueDate';
import Timer from '../Timer';

import styles from './Card.module.scss';

const Card = React.memo(
  ({
    id,
    index,
    name,
    dueDate,
    timer,
    coverUrl,
    boardId,
    listId,
    projectId,
    isPersisted,
    notificationsTotal,
    users,
    labels,
    tasks,
    allProjectsToLists,
    allBoardMemberships,
    allLabels,
    canEdit,
    onUpdate,
    onMove,
    onTransfer,
    onDelete,
    onUserAdd,
    onUserRemove,
    onBoardFetch,
    onLabelAdd,
    onLabelRemove,
    onLabelCreate,
    onLabelUpdate,
    onLabelDelete,
  }) => {
    const nameEdit = useRef(null);

    const handleClick = useCallback(() => {
      if (document.activeElement) {
        document.activeElement.blur();
      }
    }, []);

    const handleNameUpdate = useCallback(
      (newName) => {
        onUpdate({
          name: newName,
        });
      },
      [onUpdate],
    );

    const handleNameEdit = useCallback(() => {
      nameEdit.current.open();
    }, []);

    const contentNode = (
      <>
        {coverUrl && <img src={coverUrl} alt="" className={styles.cover} />}
        <div className={styles.details}>
          {labels.length > 0 && (
            <span className={styles.labels}>
              {labels.map((label) => (
                <span
                  key={label.id}
                  className={classNames(styles.attachment, styles.attachmentLeft)}
                >
                  <Label name={label.name} color={label.color} size="tiny" />
                </span>
              ))}
            </span>
          )}
          <div className={styles.name}>{name}</div>
          {tasks.length > 0 && <Tasks items={tasks} />}
          {(dueDate || timer || notificationsTotal > 0) && (
            <span className={styles.attachments}>
              {notificationsTotal > 0 && (
                <span
                  className={classNames(
                    styles.attachment,
                    styles.attachmentLeft,
                    styles.notification,
                  )}
                >
                  {notificationsTotal}
                </span>
              )}
              {dueDate && (
                <span className={classNames(styles.attachment, styles.attachmentLeft)}>
                  <DueDate value={dueDate} size="tiny" />
                </span>
              )}
              {timer && (
                <span className={classNames(styles.attachment, styles.attachmentLeft)}>
                  <Timer startedAt={timer.startedAt} total={timer.total} size="tiny" />
                </span>
              )}
            </span>
          )}
          {users.length > 0 && (
            <span className={classNames(styles.attachments, styles.attachmentsRight)}>
              {users.map((user) => (
                <span
                  key={user.id}
                  className={classNames(styles.attachment, styles.attachmentRight)}
                >
                  <User name={user.name} avatarUrl={user.avatarUrl} size="small" />
                </span>
              ))}
            </span>
          )}
        </div>
      </>
    );

    return (
      <Draggable draggableId={`card:${id}`} index={index} isDragDisabled={!isPersisted || !canEdit}>
        {({ innerRef, draggableProps, dragHandleProps }) => (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <div {...draggableProps} {...dragHandleProps} ref={innerRef} className={styles.wrapper}>
            <NameEdit ref={nameEdit} defaultValue={name} onUpdate={handleNameUpdate}>
              <div className={styles.card}>
                {isPersisted ? (
                  <>
                    <Link
                      to={Paths.CARDS.replace(':id', id)}
                      className={styles.content}
                      onClick={handleClick}
                    >
                      {contentNode}
                    </Link>
                    {canEdit && (
                      <ActionsPopup
                        card={{
                          id,
                          name,
                          dueDate,
                          timer,
                          boardId,
                          listId,
                          projectId,
                          isPersisted,
                        }}
                        projectsToLists={allProjectsToLists}
                        boardMemberships={allBoardMemberships}
                        currentUserIds={users.map((user) => user.id)}
                        labels={allLabels}
                        currentLabelIds={labels.map((label) => label.id)}
                        onNameEdit={handleNameEdit}
                        onUpdate={onUpdate}
                        onMove={onMove}
                        onTransfer={onTransfer}
                        onDelete={onDelete}
                        onUserAdd={onUserAdd}
                        onUserRemove={onUserRemove}
                        onBoardFetch={onBoardFetch}
                        onLabelAdd={onLabelAdd}
                        onLabelRemove={onLabelRemove}
                        onLabelCreate={onLabelCreate}
                        onLabelUpdate={onLabelUpdate}
                        onLabelDelete={onLabelDelete}
                      >
                        <Button className={classNames(styles.actionsButton, styles.target)}>
                          <Icon fitted name="pencil" size="small" />
                        </Button>
                      </ActionsPopup>
                    )}
                  </>
                ) : (
                  <span className={styles.content}>{contentNode}</span>
                )}
              </div>
            </NameEdit>
          </div>
        )}
      </Draggable>
    );
  },
);

Card.propTypes = {
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  dueDate: PropTypes.instanceOf(Date),
  timer: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  coverUrl: PropTypes.string,
  boardId: PropTypes.string.isRequired,
  listId: PropTypes.string.isRequired,
  projectId: PropTypes.string.isRequired,
  isPersisted: PropTypes.bool.isRequired,
  notificationsTotal: PropTypes.number.isRequired,
  /* eslint-disable react/forbid-prop-types */
  users: PropTypes.array.isRequired,
  labels: PropTypes.array.isRequired,
  tasks: PropTypes.array.isRequired,
  allProjectsToLists: PropTypes.array.isRequired,
  allBoardMemberships: PropTypes.array.isRequired,
  allLabels: PropTypes.array.isRequired,
  /* eslint-enable react/forbid-prop-types */
  canEdit: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onMove: PropTypes.func.isRequired,
  onTransfer: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onUserAdd: PropTypes.func.isRequired,
  onUserRemove: PropTypes.func.isRequired,
  onBoardFetch: PropTypes.func.isRequired,
  onLabelAdd: PropTypes.func.isRequired,
  onLabelRemove: PropTypes.func.isRequired,
  onLabelCreate: PropTypes.func.isRequired,
  onLabelUpdate: PropTypes.func.isRequired,
  onLabelDelete: PropTypes.func.isRequired,
};

Card.defaultProps = {
  dueDate: undefined,
  timer: undefined,
  coverUrl: undefined,
};

export default Card;
