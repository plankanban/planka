/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import selectors from '../../../selectors';
import UnbasedContent from './UnbasedContent';
import EditCustomFieldGroupStep from '../EditCustomFieldGroupStep';

const CustomFieldGroupStep = React.memo(({ id, onBack, onClose }) => {
  const selectCustomFielGroupdById = useMemo(() => selectors.makeSelectCustomFieldGroupById(), []);

  const customFieldGroup = useSelector((state) => selectCustomFielGroupdById(state, id));

  if (customFieldGroup.baseCustomFieldGroupId) {
    return (
      <EditCustomFieldGroupStep
        withDeleteButton
        id={id}
        onBack={onBack}
        onClose={onBack || onClose}
      />
    );
  }

  return <UnbasedContent id={id} onBack={onBack || onClose} />;
});

CustomFieldGroupStep.propTypes = {
  id: PropTypes.string.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

CustomFieldGroupStep.defaultProps = {
  onBack: undefined,
};

export default CustomFieldGroupStep;
