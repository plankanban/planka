import { attr, fk } from 'redux-orm';

import BaseModel from './BaseModel';
import ActionTypes from '../constants/ActionTypes';

export default class extends BaseModel {
  static modelName = 'Label';

  static fields = {
    id: attr(),
    position: attr(),
    name: attr(),
    color: attr(),
    boardId: fk({
      to: 'Board',
      as: 'board',
      relatedName: 'labels',
    }),
  };

  static reducer({ type, payload }, Label) {
    switch (type) {
      case ActionTypes.LOCATION_CHANGE_HANDLE:
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.PROJECT_MANAGER_CREATE_HANDLE:
      case ActionTypes.BOARD_MEMBERSHIP_CREATE_HANDLE:
        if (payload.labels) {
          payload.labels.forEach((label) => {
            Label.upsert(label);
          });
        }

        break;
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        Label.all().delete();

        if (payload.labels) {
          payload.labels.forEach((label) => {
            Label.upsert(label);
          });
        }

        break;
      case ActionTypes.BOARD_FETCH__SUCCESS:
        payload.labels.forEach((label) => {
          Label.upsert(label);
        });

        break;
      case ActionTypes.LABEL_CREATE:
      case ActionTypes.LABEL_CREATE_HANDLE:
      case ActionTypes.LABEL_UPDATE__SUCCESS:
      case ActionTypes.LABEL_UPDATE_HANDLE:
        Label.upsert(payload.label);

        break;
      case ActionTypes.LABEL_CREATE__SUCCESS:
        Label.withId(payload.localId).delete();
        Label.upsert(payload.label);

        break;
      case ActionTypes.LABEL_UPDATE:
        Label.withId(payload.id).update(payload.data);

        break;
      case ActionTypes.LABEL_DELETE:
        Label.withId(payload.id).delete();

        break;
      case ActionTypes.LABEL_DELETE__SUCCESS:
      case ActionTypes.LABEL_DELETE_HANDLE: {
        const labelModel = Label.withId(payload.label.id);

        if (labelModel) {
          labelModel.delete();
        }

        break;
      }
      default:
    }
  }

  static findLabelsFromText(filterText, labels) {
    const selectLabel = filterText.toLocaleLowerCase();
    const matchingLabels = labels.filter((label) =>
      label.name ? label.name.toLocaleLowerCase().startsWith(selectLabel) : false,
    );
    if (matchingLabels.length === 1) {
      // Appens the user to the filter
      return matchingLabels[0].id;
    }
    return null;
  }
}
