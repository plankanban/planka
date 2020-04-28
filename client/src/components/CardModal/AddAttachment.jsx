import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { FilePicker } from '../../lib/custom-ui';

const AddAttachment = React.memo(({ children, onCreate }) => {
  const handleFileSelect = useCallback(
    (file) => {
      onCreate({
        file,
      });
    },
    [onCreate],
  );

  return <FilePicker onSelect={handleFileSelect}>{children}</FilePicker>;
});

AddAttachment.propTypes = {
  children: PropTypes.element.isRequired,
  onCreate: PropTypes.func.isRequired,
};

export default AddAttachment;
