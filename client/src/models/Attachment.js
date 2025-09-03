/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { attr, fk } from 'redux-orm';

import BaseModel from './BaseModel';
import getFilenameAndExtension from '../utils/get-filename-and-extension';
import ActionTypes from '../constants/ActionTypes';
import { AttachmentTypes } from '../constants/Enums';

const prepareAttachment = (attachment) => {
  if (attachment.type !== AttachmentTypes.FILE || !attachment.data) {
    return attachment;
  }

  const { filename, extension } = getFilenameAndExtension(attachment.data.url);

  return {
    ...attachment,
    data: {
      ...attachment.data,
      filename,
      extension,
    },
  };
};

export default class extends BaseModel {
  static modelName = 'Attachment';

  static fields = {
    id: attr(),
    type: attr(),
    data: attr(),
    name: attr(),
    createdAt: attr({
      getDefault: () => new Date(),
    }),
    cardId: fk({
      to: 'Card',
      as: 'card',
      relatedName: 'attachments',
    }),
    creatorUserId: fk({
      to: 'User',
      as: 'creatorUser',
      relatedName: 'createdAttachments',
    }),
  };

  static reducer({ type, payload }, Attachment) {
    switch (type) {
      case ActionTypes.LOCATION_CHANGE_HANDLE:
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.USER_UPDATE_HANDLE:
      case ActionTypes.PROJECT_UPDATE_HANDLE:
      case ActionTypes.PROJECT_MANAGER_CREATE_HANDLE:
      case ActionTypes.BOARD_MEMBERSHIP_CREATE_HANDLE:
      case ActionTypes.LIST_UPDATE_HANDLE:
      case ActionTypes.CARD_UPDATE_HANDLE:
        if (payload.attachments) {
          payload.attachments.forEach((attachment) => {
            Attachment.upsert(prepareAttachment(attachment));
          });
        }

        break;
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        Attachment.all().delete();

        if (payload.attachments) {
          payload.attachments.forEach((attachment) => {
            Attachment.upsert(prepareAttachment(attachment));
          });
        }

        break;
      case ActionTypes.BOARD_FETCH__SUCCESS:
      case ActionTypes.CARDS_FETCH__SUCCESS:
      case ActionTypes.CARD_CREATE_HANDLE:
      case ActionTypes.CARD_DUPLICATE__SUCCESS:
        payload.attachments.forEach((attachment) => {
          Attachment.upsert(prepareAttachment(attachment));
        });

        break;
      case ActionTypes.ATTACHMENT_CREATE:
      case ActionTypes.ATTACHMENT_CREATE_HANDLE:
      case ActionTypes.ATTACHMENT_UPDATE__SUCCESS:
      case ActionTypes.ATTACHMENT_UPDATE_HANDLE:
        Attachment.upsert(prepareAttachment(payload.attachment));

        break;
      case ActionTypes.ATTACHMENT_CREATE__SUCCESS:
        Attachment.withId(payload.localId).delete();
        Attachment.upsert(prepareAttachment(payload.attachment));

        break;
      case ActionTypes.ATTACHMENT_CREATE__FAILURE:
        Attachment.withId(payload.localId).delete();

        break;
      case ActionTypes.ATTACHMENT_UPDATE:
        Attachment.withId(payload.id).update(payload.data);

        break;
      case ActionTypes.ATTACHMENT_DELETE:
        Attachment.withId(payload.id).delete();

        break;
      case ActionTypes.ATTACHMENT_DELETE__SUCCESS:
      case ActionTypes.ATTACHMENT_DELETE_HANDLE: {
        const attachmentModel = Attachment.withId(payload.attachment.id);

        if (attachmentModel) {
          attachmentModel.delete();
        }

        break;
      }
      default:
    }
  }

  duplicate(id, data) {
    return this.getClass().create({
      id,
      cardId: this.cardId,
      creatorUserId: this.creatorUserId,
      type: this.type,
      data: this.data,
      name: this.name,
      ...data,
    });
  }
}
