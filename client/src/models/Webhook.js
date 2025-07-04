/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { attr, fk } from 'redux-orm';

import BaseModel from './BaseModel';
import ActionTypes from '../constants/ActionTypes';

export default class extends BaseModel {
  static modelName = 'Webhook';

  static fields = {
    id: attr(),
    name: attr(),
    url: attr(),
    accessToken: attr(),
    events: attr(),
    excludedEvents: attr(),
    boardId: fk({
      to: 'Board',
      as: 'board',
      relatedName: 'webhooks',
    }),
  };

  static reducer({ type, payload }, Webhook) {
    switch (type) {
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        Webhook.all().delete();

        payload.webhooks.forEach((webhook) => {
          Webhook.upsert(webhook);
        });

        break;
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.USER_UPDATE_HANDLE:
        if (payload.webhooks) {
          payload.webhooks.forEach((webhook) => {
            Webhook.upsert(webhook);
          });
        }

        break;
      case ActionTypes.WEBHOOK_CREATE:
      case ActionTypes.WEBHOOK_CREATE_HANDLE:
      case ActionTypes.WEBHOOK_UPDATE__SUCCESS:
      case ActionTypes.WEBHOOK_UPDATE_HANDLE:
        Webhook.upsert(payload.webhook);

        break;
      case ActionTypes.WEBHOOK_CREATE__SUCCESS:
        Webhook.withId(payload.localId).delete();
        Webhook.upsert(payload.webhook);

        break;
      case ActionTypes.WEBHOOK_CREATE__FAILURE:
        Webhook.withId(payload.localId).delete();

        break;
      case ActionTypes.WEBHOOK_UPDATE:
        Webhook.withId(payload.id).update(payload.data);

        break;
      case ActionTypes.WEBHOOK_DELETE:
        Webhook.withId(payload.id).delete();

        break;
      case ActionTypes.WEBHOOK_DELETE__SUCCESS:
      case ActionTypes.WEBHOOK_DELETE_HANDLE: {
        const webhookModel = Webhook.withId(payload.webhook.id);

        if (webhookModel) {
          webhookModel.delete();
        }

        break;
      }
      default:
    }
  }

  static getAllQuerySet() {
    return this.orderBy(['id.length', 'id']);
  }
}
