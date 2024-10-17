import { attr, fk } from 'redux-orm';

import BaseModel from './BaseModel';
import ActionTypes from '../constants/ActionTypes';

export default class extends BaseModel {
  static modelName = 'Attachment';

  static fields = {
    id: attr(),
    url: attr(),
    coverUrl: attr(),
    image: attr(),
    name: attr(),
    createdAt: attr({
      getDefault: () => new Date(),
    }),
    cardId: fk({
      to: 'Card',
      as: 'card',
      relatedName: 'attachments',
    }),
  };

  static reducer({ type, payload }, Attachment) {
    switch (type) {
      case ActionTypes.LOCATION_CHANGE_HANDLE:
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.PROJECT_MANAGER_CREATE_HANDLE:
      case ActionTypes.BOARD_MEMBERSHIP_CREATE_HANDLE:
      case ActionTypes.CARD_UPDATE_HANDLE:
        if (payload.attachments) {
          payload.attachments.forEach((attachment) => {
            Attachment.upsert(attachment);
          });
        }

        break;
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        if (payload.attachments) {
          // FIXME: bug with oneToOne relation in Redux-ORM
          const attachmentIds = payload.attachments.map((attachment) => attachment.id);

          Attachment.all()
            .toModelArray()
            .forEach((attachmentModel) => {
              if (!attachmentIds.includes(attachmentModel.id)) {
                attachmentModel.delete();
              }
            });

          payload.attachments.forEach((attachment) => {
            Attachment.upsert(attachment);
          });
        } else {
          Attachment.all().delete();
        }

        break;
      case ActionTypes.BOARD_FETCH__SUCCESS:
        payload.attachments.forEach((attachment) => {
          Attachment.upsert(attachment);
        });

        break;
      case ActionTypes.ATTACHMENT_CREATE:
      case ActionTypes.ATTACHMENT_CREATE_HANDLE:
      case ActionTypes.ATTACHMENT_UPDATE__SUCCESS:
      case ActionTypes.ATTACHMENT_UPDATE_HANDLE:
        Attachment.upsert(payload.attachment);

        break;
      case ActionTypes.ATTACHMENT_CREATE__SUCCESS:
        Attachment.withId(payload.localId).delete();
        Attachment.upsert(payload.attachment);

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
}
