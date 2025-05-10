/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useRef } from 'react';
import PropTypes from 'prop-types';

import styles from './FilePicker.module.css';

const FilePicker = React.memo(({ children, accept, multiple, onSelect }) => {
  const fieldRef = useRef(null);

  const handleTriggerClick = useCallback(() => {
    fieldRef.current.click();
  }, []);

  const handleFieldChange = useCallback(
    ({ target }) => {
      onSelect(multiple ? [...target.files] : target.files[0]);
      target.value = null; // eslint-disable-line no-param-reassign
    },
    [multiple, onSelect],
  );

  const tigger = React.cloneElement(children, {
    onClick: handleTriggerClick,
  });

  return (
    <>
      {tigger}
      <input
        ref={fieldRef}
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
  multiple: undefined,
};

export default FilePicker;
