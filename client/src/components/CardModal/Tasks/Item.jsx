import React, { useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Button, Checkbox, Icon } from 'semantic-ui-react';

import NameEdit from './NameEdit';
import ActionsPopup from './ActionsPopup';

import styles from './Item.module.scss';

const Item = React.memo(({ name, isCompleted, isPersisted, canEdit, onUpdate, onDelete }) => {
  const nameEdit = useRef(null);

  const handleClick = useCallback(() => {
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

  const handleToggleChange = useCallback(() => {
    onUpdate({
      isCompleted: !isCompleted,
    });
  }, [isCompleted, onUpdate]);

  const handleNameEdit = useCallback(() => {
    nameEdit.current.open();
  }, []);

  return (
    <div className={styles.wrapper}>
      <span className={styles.checkboxWrapper}>
        <Checkbox
          checked={isCompleted}
          disabled={!isPersisted || !canEdit}
          className={styles.checkbox}
          onChange={handleToggleChange}
        />
      </span>
      <NameEdit ref={nameEdit} defaultValue={name} onUpdate={handleNameUpdate}>
        <div className={classNames(canEdit && styles.contentHoverable)}>
          {/* eslint-disable jsx-a11y/click-events-have-key-events,
                             jsx-a11y/no-static-element-interactions */}
          <span
            className={classNames(styles.text, canEdit && styles.textEditable)}
            onClick={handleClick}
          >
            {/* eslint-enable jsx-a11y/click-events-have-key-events,
                              jsx-a11y/no-static-element-interactions */}
            <span className={classNames(styles.task, isCompleted && styles.taskCompleted)}>
              {name}
            </span>
          </span>
          {isPersisted && canEdit && (
            <ActionsPopup onNameEdit={handleNameEdit} onDelete={onDelete}>
              <Button className={classNames(styles.button, styles.target)}>
                <Icon fitted name="pencil" size="small" />
              </Button>
            </ActionsPopup>
          )}
        </div>
      </NameEdit>
    </div>
  );
});

Item.propTypes = {
  name: PropTypes.string.isRequired,
  isCompleted: PropTypes.bool.isRequired,
  isPersisted: PropTypes.bool.isRequired,
  canEdit: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default Item;
