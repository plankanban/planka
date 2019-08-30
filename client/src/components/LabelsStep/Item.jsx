import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Button } from 'semantic-ui-react';

import LabelColors from '../../constants/LabelColors';

import styles from './Item.module.css';

const Item = React.memo(({
  name, color, isPersisted, isActive, onSelect, onDeselect, onEdit,
}) => {
  const handleToggleClick = useCallback(() => {
    if (isActive) {
      onDeselect();
    } else {
      onSelect();
    }
  }, [isActive, onSelect, onDeselect]);

  return (
    <div className={styles.wrapper}>
      <Button
        fluid
        content={name}
        active={isActive}
        disabled={!isPersisted}
        className={classNames(styles.labelButton, isActive && styles.labelButtonActive)}
        style={{
          background: LabelColors.MAP[color],
        }}
        onClick={handleToggleClick}
      />
      <Button
        icon="pencil"
        size="small"
        disabled={!isPersisted}
        className={styles.editButton}
        onClick={onEdit}
      />
    </div>
  );
});

Item.propTypes = {
  name: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  isPersisted: PropTypes.bool.isRequired,
  isActive: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  onDeselect: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default Item;
