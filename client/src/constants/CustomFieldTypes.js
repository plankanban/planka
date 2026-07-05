/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const CustomFieldTypes = {
  TEXT: 'text',
  NUMBER: 'number',
  DATE: 'date',
  CHECKBOX: 'checkbox',
  DROPDOWN: 'dropdown',
};

export const CUSTOM_FIELD_TYPE_LABEL_KEYS_BY_TYPE = {
  [CustomFieldTypes.TEXT]: 'common.text',
  [CustomFieldTypes.NUMBER]: 'common.number',
  [CustomFieldTypes.DATE]: 'common.date',
  [CustomFieldTypes.CHECKBOX]: 'common.checkbox',
  [CustomFieldTypes.DROPDOWN]: 'common.dropdown',
};

export default CustomFieldTypes;
