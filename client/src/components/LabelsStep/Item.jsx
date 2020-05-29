import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Button } from 'semantic-ui-react';

import styles from './Item.module.scss';
import globalStyles from '../../styles.module.scss';

const Item = React.memo(({ name, color, isPersisted, isActive, onSelect, onDeselect, onEdit }) => {
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
        className={classNames(
          styles.labelButton,
          isActive && styles.labelButtonActive,
          globalStyles[`background${upperFirst(camelCase(color))}`],
        )}
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
  name: PropTypes.string,
  color: PropTypes.string.isRequired,
  isPersisted: PropTypes.bool.isRequired,
  isActive: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  onDeselect: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

Item.defaultProps = {
  name: undefined,
};

export default Item;
