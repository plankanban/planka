import React, { useCallback, useRef } from 'react';
import PropTypes from 'prop-types';

import styles from './FilePicker.module.css';

const FilePicker = React.memo(({ children, accept, multiple, onSelect }) => {
  const field = useRef(null);

  const handleTriggerClick = useCallback(() => {
    field.current.click();
  }, []);

  const handleFieldChange = useCallback(
    ({ target }) => {
      [...target.files].forEach((file) => {
        onSelect(file);
      });

      target.value = null; // eslint-disable-line no-param-reassign
    },
    [onSelect],
  );

  const tigger = React.cloneElement(children, {
    onClick: handleTriggerClick,
  });

  return (
    <>
      {tigger}
      <input
        ref={field}
        type="file"
        accept={accept}
        multiple={multiple}
        className={styles.field}
        onChange={handleFieldChange}
      />
    </>
  );
});

FilePicker.propTypes = {
  children: PropTypes.element.isRequired,
  accept: PropTypes.string,
  multiple: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
};

FilePicker.defaultProps = {
  accept: undefined,
  multiple: false,
};

export default FilePicker;
