/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import selectors from '../../../selectors';
import CustomField from '../../custom-fields/CustomField';

import styles from './CustomFieldGroup.module.scss';

const CustomFieldGroup = React.memo(({ id }) => {
  const selectCustomFieldIdsByGroupId = useMemo(
    () => selectors.makeSelectCustomFieldIdsByGroupId(),
    [],
  );

  const customFieldIds = useSelector((state) => selectCustomFieldIdsByGroupId(state, id));

  return (
    <div className={styles.wrapper}>
      {customFieldIds.map((customFieldId) => (
        <CustomField key={customFieldId} id={customFieldId} customFieldGroupId={id} />
      ))}
    </div>
  );
});

CustomFieldGroup.propTypes = {
  id: PropTypes.string.isRequired,
};

export default CustomFieldGroup;
