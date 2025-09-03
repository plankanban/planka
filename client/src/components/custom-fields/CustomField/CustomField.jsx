/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Icon } from 'semantic-ui-react';

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
  const [isCopied, setIsCopied] = useState(false);

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

  const handleCopyClick = useCallback(() => {
    if (isCopied) {
      return;
    }

    navigator.clipboard.writeText(customFieldValue.content);

    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  }, [customFieldValue, isCopied]);

  return (
    <div>
      <div className={styles.name}>{customField.name}</div>
      <div className={styles.valueWrapper}>
        {canEdit ? (
          <ValueField
            defaultValue={customFieldValue && customFieldValue.content}
            disabled={!customField.isPersisted}
            onUpdate={handleValueUpdate}
          />
        ) : (
          <div className={styles.value}>
            {customFieldValue ? customFieldValue.content : '\u00A0'}
          </div>
        )}
        {customFieldValue && customFieldValue.content && (
          <Button className={styles.copyButton} onClick={handleCopyClick}>
            <Icon fitted name={isCopied ? 'check' : 'copy'} />
          </Button>
        )}
      </div>
    </div>
  );
});

CustomField.propTypes = {
  id: PropTypes.string.isRequired,
  customFieldGroupId: PropTypes.string.isRequired,
};

export default CustomField;
