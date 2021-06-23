import { createSelector } from 'redux-orm';

import orm from '../orm';

// eslint-disable-next-line import/prefer-default-export
export const isAttachmentWithIdExistsSelector = createSelector(
  orm,
  (_, id) => id,
  ({ Attachment }, id) => Attachment.idExists(id),
);
