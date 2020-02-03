import React, { useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Button, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { Draggable } from 'react-beautiful-dnd';

import Paths from '../../constants/Paths';
import Tasks from './Tasks';
import EditName from './EditName';
import ActionsPopup from './ActionsPopup';
import User from '../User';
import Label from '../Label';
import DueDate from '../DueDate';
import Timer from '../Timer';

import styles from './Card.module.css';

const Card = React.memo(
  ({
    id,
    index,
    name,
    dueDate,
    timer,
    isPersisted,
    notificationsTotal,
    users,
    labels,
    tasks,
    allProjectMemberships,
    allLabels,
    onUpdate,
    onDelete,
    onUserAdd,
    onUserRemove,
    onLabelAdd,
    onLabelRemove,
    onLabelCreate,
    onLabelUpdate,
    onLabelDelete,
  }) => {
    const editName = useRef(null);

    const handleClick = useCallback(() => {
      if (document.activeElement) {
        document.activeElement.blur();
      }
    }, []);

    const handleNameUpdate = useCallback(
      newName => {
        onUpdate({
          name: newName,
        });
      },
      [onUpdate],
    );

    const handleNameEdit = useCallback(() => {
      editName.current.open();
    }, []);

    const contentNode = (
      <>
        {labels.length > 0 && (
          <span className={styles.labels}>
            {labels.map(label => (
              <span key={label.id} className={classNames(styles.attachment, styles.attachmentLeft)}>
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
            {users.map(user => (
              <span key={user.id} className={classNames(styles.attachment, styles.attachmentRight)}>
                <User name={user.name} avatar={user.avatar} size="tiny" />
              </span>
            ))}
          </span>
        )}
      </>
    );

    return (
      <Draggable draggableId={`card:${id}`} index={index} isDragDisabled={!isPersisted}>
        {({ innerRef, draggableProps, dragHandleProps }) => (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <div {...draggableProps} {...dragHandleProps} ref={innerRef} className={styles.wrapper}>
            <EditName ref={editName} defaultValue={name} onUpdate={handleNameUpdate}>
              <div className={styles.card}>
                {isPersisted ? (
                  <>
                    <Link
                      to={isPersisted && Paths.CARDS.replace(':id', id)}
                      className={styles.content}
                      onClick={handleClick}
                    >
                      {contentNode}
                    </Link>
                    <ActionsPopup
                      card={{
                        id,
                        name,
                        dueDate,
                        timer,
                        isPersisted,
                      }}
                      projectMemberships={allProjectMemberships}
                      currentUserIds={users.map(user => user.id)}
                      labels={allLabels}
                      currentLabelIds={labels.map(label => label.id)}
                      onNameEdit={handleNameEdit}
                      onUpdate={onUpdate}
                      onDelete={onDelete}
                      onUserAdd={onUserAdd}
                      onUserRemove={onUserRemove}
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
                  </>
                ) : (
                  <span className={styles.content}>{contentNode}</span>
                )}
              </div>
            </EditName>
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
  isPersisted: PropTypes.bool.isRequired,
  notificationsTotal: PropTypes.number.isRequired,
  /* eslint-disable react/forbid-prop-types */
  users: PropTypes.array.isRequired,
  labels: PropTypes.array.isRequired,
  tasks: PropTypes.array.isRequired,
  allProjectMemberships: PropTypes.array.isRequired,
  allLabels: PropTypes.array.isRequired,
  /* eslint-enable react/forbid-prop-types */
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onUserAdd: PropTypes.func.isRequired,
  onUserRemove: PropTypes.func.isRequired,
  onLabelAdd: PropTypes.func.isRequired,
  onLabelRemove: PropTypes.func.isRequired,
  onLabelCreate: PropTypes.func.isRequired,
  onLabelUpdate: PropTypes.func.isRequired,
  onLabelDelete: PropTypes.func.isRequired,
};

Card.defaultProps = {
  dueDate: undefined,
  timer: undefined,
};

export default Card;
