import { createSelector } from 'redux-orm';

import orm from '../orm';

export const selectIsAttachmentWithIdExists = createSelector(
  orm,
  (_, id) => id,
  ({ Attachment }, id) => Attachment.idExists(id),
);

export default {
  selectIsAttachmentWithIdExists,
};
