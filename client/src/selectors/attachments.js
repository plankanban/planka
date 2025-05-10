/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { createSelector } from 'redux-orm';

import orm from '../orm';
import { isLocalId } from '../utils/local-id';

export const makeSelectAttachmentById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Attachment }, id) => {
      const attachmentModel = Attachment.withId(id);

      if (!attachmentModel) {
        return attachmentModel;
      }

      return {
        ...attachmentModel.ref,
        isPersisted: !isLocalId(attachmentModel.id),
      };
    },
  );

export const selectAttachmentById = makeSelectAttachmentById();

export const selectIsAttachmentWithIdExists = createSelector(
  orm,
  (_, id) => id,
  ({ Attachment }, id) => Attachment.idExists(id),
);

export default {
  makeSelectAttachmentById,
  selectAttachmentById,
  selectIsAttachmentWithIdExists,
};
