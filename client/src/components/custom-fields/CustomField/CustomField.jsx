/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { buildCustomFieldValueId } from '../../../models/CustomFieldValue';
import { isListArchiveOrTrash } from '../../../utils/record-helpers';
import { BoardMembershipRoles } from '../../../constants/Enums';
import ValueField from './ValueField';

import styles from './CustomField.module.scss';

const CustomField = React.memo(({ id, customFieldGroupId }) => {
  const selectCustomFieldById = useMemo(() => selectors.makeSelectCustomFieldById(), []);
  const selectCustomFieldValueById = useMemo(() => selectors.makeSelectCustomFieldValueById(), []);
  const selectListById = useMemo(() => selectors.makeSelectListById(), []);

  const { cardId } = useSelector(selectors.selectPath);
  const customField = useSelector((state) => selectCustomFieldById(state, id));

  const customFieldValue = useSelector((state) =>
    selectCustomFieldValueById(
      state,
      buildCustomFieldValueId({
        cardId,
        customFieldGroupId,
        customFieldId: id,
      }),
    ),
  );

  const canEdit = useSelector((state) => {
    const { listId } = selectors.selectCurrentCard(state);
    const list = selectListById(state, listId);

    if (isListArchiveOrTrash(list)) {
      return false;
    }

    const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
    return !!boardMembership && boardMembership.role === BoardMembershipRoles.EDITOR;
  });

  const dispatch = useDispatch();

  const handleValueUpdate = useCallback(
    (content) => {
      if (content) {
        dispatch(
          entryActions.updateCustomFieldValue(cardId, customFieldGroupId, id, {
            content,
          }),
        );
      } else {
        dispatch(entryActions.deleteCustomFieldValue(cardId, customFieldGroupId, id));
      }
    },
    [id, customFieldGroupId, cardId, dispatch],
  );

  return (
    <div>
      <div className={styles.name}>{customField.name}</div>
      {canEdit ? (
        <ValueField
          defaultValue={customFieldValue && customFieldValue.content}
          disabled={!customField.isPersisted}
          onUpdate={handleValueUpdate}
        />
      ) : (
        <div className={styles.value}>{customFieldValue ? customFieldValue.content : '\u00A0'}</div>
      )}
    </div>
  );
});

CustomField.propTypes = {
  id: PropTypes.string.isRequired,
  customFieldGroupId: PropTypes.string.isRequired,
};

export default CustomField;
