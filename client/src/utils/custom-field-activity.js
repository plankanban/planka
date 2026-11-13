/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import truncate from 'lodash/truncate';

export const MAX_CUSTOM_FIELD_ACTIVITY_CONTENT_LENGTH = 200;

// Values for an `updateCustomFieldValue` activity. Tolerates missing data so a
// malformed or older action can never crash the activity list.
export const getCustomFieldActivityValues = (data) => ({
  customField: (data && data.customFieldName) || '',
  content: truncate((data && data.content) || '', {
    length: MAX_CUSTOM_FIELD_ACTIVITY_CONTENT_LENGTH,
  }),
});
