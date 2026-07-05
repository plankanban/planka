/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Icon } from 'semantic-ui-react';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { buildCustomFieldValueId } from '../../../models/CustomFieldValue';
import { isListArchiveOrTrash } from '../../../utils/record-helpers';
import { BoardMembershipRoles } from '../../../constants/Enums';
import CustomFieldTypes from '../../../constants/CustomFieldTypes';
import ValueField from './ValueField';
import NumberValueField from './NumberValueField';
import DateValueField from './DateValueField';
import CheckboxValueField from './CheckboxValueField';
import SelectValueField from './SelectValueField';

import styles from './CustomField.module.scss';
import globalStyles from '../../../styles.module.scss';

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

  const selectedOption = useMemo(() => {
    if (customField.type !== CustomFieldTypes.DROPDOWN || !customFieldValue) {
      return undefined;
    }

    return (customField.config.options || []).find(
      (option) => option.id === customFieldValue.content,
    );
  }, [customField, customFieldValue]);

  const canEditValue = canEdit && customField.isPersisted;

  let valueEditNode;
  switch (customField.type) {
    case CustomFieldTypes.NUMBER:
      valueEditNode = (
        <NumberValueField
          defaultValue={customFieldValue && customFieldValue.content}
          onUpdate={handleValueUpdate}
        />
      );
      break;
    case CustomFieldTypes.DATE:
      valueEditNode = (
        <DateValueField
          defaultValue={customFieldValue && customFieldValue.content}
          onUpdate={handleValueUpdate}
        />
      );
      break;
    case CustomFieldTypes.CHECKBOX:
      valueEditNode = (
        <CheckboxValueField
          defaultValue={customFieldValue && customFieldValue.content}
          onUpdate={handleValueUpdate}
        />
      );
      break;
    case CustomFieldTypes.DROPDOWN:
      valueEditNode = (
        <SelectValueField
          defaultValue={customFieldValue && customFieldValue.content}
          options={customField.config.options || []}
          onUpdate={handleValueUpdate}
        />
      );
      break;
    default:
      valueEditNode = (
        <ValueField
          defaultValue={customFieldValue && customFieldValue.content}
          onUpdate={handleValueUpdate}
        />
      );
  }

  let valueDisplayNode;
  if (customField.type === CustomFieldTypes.CHECKBOX) {
    const isChecked = !!customFieldValue && customFieldValue.content === 'true';

    valueDisplayNode = <Icon fitted name={isChecked ? 'check square' : 'square outline'} />;
  } else if (customField.type === CustomFieldTypes.DROPDOWN) {
    valueDisplayNode = selectedOption ? (
      <span
        className={classNames(
          styles.pill,
          selectedOption.color &&
            globalStyles[`background${upperFirst(camelCase(selectedOption.color))}`],
        )}
      >
        {selectedOption.name}
      </span>
    ) : (
      '\u00A0'
    );
  } else {
    valueDisplayNode = customFieldValue ? customFieldValue.content : '\u00A0';
  }

  const isCopyable =
    customField.type !== CustomFieldTypes.CHECKBOX &&
    customField.type !== CustomFieldTypes.DROPDOWN;

  return (
    <div>
      <div className={styles.name}>{customField.name}</div>
      <div className={styles.valueWrapper}>
        {canEditValue ? (
          valueEditNode
        ) : (
          <div className={styles.value}>{valueDisplayNode}</div>
        )}
        {isCopyable && customFieldValue && customFieldValue.content && (
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
