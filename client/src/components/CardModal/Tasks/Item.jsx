import React, { useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Button, Checkbox, Icon } from 'semantic-ui-react';

import EditName from './EditName';
import ActionsPopup from './ActionsPopup';

import styles from './Item.module.css';

const Item = React.memo(({
  name, isCompleted, isPersisted, onUpdate, onDelete,
}) => {
  const editName = useRef(null);

  const handleClick = useCallback(() => {
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

  const handleToggleChange = useCallback(() => {
    onUpdate({
      isCompleted: !isCompleted,
    });
  }, [isCompleted, onUpdate]);

  const handleNameEdit = useCallback(() => {
    editName.current.open();
  }, []);

  return (
    <div className={styles.wrapper}>
      <span className={styles.checkboxWrapper}>
        <Checkbox
          checked={isCompleted}
          disabled={!isPersisted}
          className={styles.checkbox}
          onChange={handleToggleChange}
        />
      </span>
      <EditName ref={editName} defaultValue={name} onUpdate={handleNameUpdate}>
        <div className={styles.content}>
          {/* eslint-disable jsx-a11y/click-events-have-key-events,
                             jsx-a11y/no-static-element-interactions */}
          <span className={styles.text} onClick={handleClick}>
            {/* eslint-enable jsx-a11y/click-events-have-key-events,
                              jsx-a11y/no-static-element-interactions */}
            <span className={classNames(styles.task, isCompleted && styles.taskCompleted)}>
              {name}
            </span>
          </span>
          {isPersisted && (
            <ActionsPopup onNameEdit={handleNameEdit} onDelete={onDelete}>
              <Button className={classNames(styles.button, styles.target)}>
                <Icon fitted name="pencil" size="small" />
              </Button>
            </ActionsPopup>
          )}
        </div>
      </EditName>
    </div>
  );
});

Item.propTypes = {
  name: PropTypes.string.isRequired,
  isCompleted: PropTypes.bool.isRequired,
  isPersisted: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default Item;
