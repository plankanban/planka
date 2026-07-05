/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Icon } from 'semantic-ui-react';

import selectors from '../../../selectors';
import CustomFieldTypes from '../../../constants/CustomFieldTypes';

import styles from './CustomFieldValueChip.module.scss';
import globalStyles from '../../../styles.module.scss';

const Sizes = {
  TINY: 'tiny',
  SMALL: 'small',
  MEDIUM: 'medium',
};

const CustomFieldValueChip = React.memo(({ id, size, onClick }) => {
  const [t] = useTranslation();

  const selectCustomFieldValueById = useMemo(() => selectors.makeSelectCustomFieldValueById(), []);
  const selectCustomFieldById = useMemo(() => selectors.makeSelectCustomFieldById(), []);

  const customFieldValue = useSelector((state) => selectCustomFieldValueById(state, id));

  const customField = useSelector((state) =>
    selectCustomFieldById(state, customFieldValue.customFieldId),
  );

  let title;
  let bodyNode;
  let backgroundClassName;

  switch (customField.type) {
    case CustomFieldTypes.NUMBER:
      title = `${customField.name}: ${customFieldValue.content}`;
      bodyNode = title;
      break;
    case CustomFieldTypes.DATE: {
      const formattedDate = t('format:date', {
        postProcess: 'formatDate',
        value: new Date(`${customFieldValue.content}T00:00:00`),
      });

      title = `${customField.name}: ${formattedDate}`;
      bodyNode = title;
      break;
    }
    case CustomFieldTypes.CHECKBOX:
      title = customField.name;
      bodyNode = <Icon fitted name="check" />;
      break;
    case CustomFieldTypes.DROPDOWN: {
      const selectedOption = (customField.config.options || []).find(
        (option) => option.id === customFieldValue.content,
      );

      title = selectedOption ? `${customField.name}: ${selectedOption.name}` : customField.name;
      bodyNode = selectedOption ? selectedOption.name : ' ';
      backgroundClassName =
        selectedOption &&
        selectedOption.color &&
        globalStyles[`background${upperFirst(camelCase(selectedOption.color))}`];
      break;
    }
    default:
      title = `${customField.name}: ${customFieldValue.content}`;
      bodyNode = (
        <>
          {!Number.isNaN(parseFloat(customFieldValue.content)) && `${customField.name}: `}
          {customFieldValue.content}
        </>
      );
  }

  const contentNode = (
    <span
      title={title}
      className={classNames(
        styles.wrapper,
        styles[`wrapper${upperFirst(size)}`],
        onClick && styles.wrapperHoverable,
        backgroundClassName && styles.wrapperColored,
        backgroundClassName,
      )}
    >
      {bodyNode}
    </span>
  );

  return onClick ? (
    <button
      type="button"
      disabled={customField.isDisabled}
      className={styles.button}
      onClick={onClick}
    >
      {contentNode}
    </button>
  ) : (
    contentNode
  );
});

CustomFieldValueChip.propTypes = {
  id: PropTypes.string.isRequired,
  size: PropTypes.oneOf(Object.values(Sizes)),
  onClick: PropTypes.func,
};

CustomFieldValueChip.defaultProps = {
  size: Sizes.MEDIUM,
  onClick: undefined,
};

export default CustomFieldValueChip;
