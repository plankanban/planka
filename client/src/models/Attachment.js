import { Model, attr, fk } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';

export default class extends Model {
  static modelName = 'Attachment';

  static fields = {
    id: attr(),
    url: attr(),
    coverUrl: attr(),
    name: attr(),
    cardId: fk({
      to: 'Card',
      as: 'card',
      relatedName: 'attachments',
    }),
  };

  static reducer({ type, payload }, Attachment) {
    switch (type) {
      case ActionTypes.BOARD_FETCH_SUCCEEDED:
      case ActionTypes.CARD_CREATE_SUCCEEDED:
      case ActionTypes.CARD_CREATE_RECEIVED:
        payload.attachments.forEach((attachment) => {
          Attachment.upsert(attachment);
        });

        break;
      case ActionTypes.ATTACHMENT_CREATE:
      case ActionTypes.ATTACHMENT_CREATE_RECEIVED:
        Attachment.upsert(payload.attachment);

        break;
      case ActionTypes.ATTACHMENT_UPDATE:
        Attachment.withId(payload.id).update(payload.data);

        break;
      case ActionTypes.ATTACHMENT_DELETE:
        Attachment.withId(payload.id).delete();

        break;
      case ActionTypes.ATTACHMENT_CREATE_SUCCEEDED:
        Attachment.withId(payload.localId).delete();
        Attachment.upsert(payload.attachment);

        break;
      case ActionTypes.ATTACHMENT_UPDATE_RECEIVED:
        Attachment.withId(payload.attachment.id).update(payload.attachment);

        break;
      case ActionTypes.ATTACHMENT_DELETE_RECEIVED:
        Attachment.withId(payload.attachment.id).delete();

        break;
      default:
    }
  }
}
