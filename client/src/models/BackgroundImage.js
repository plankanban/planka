/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { attr, fk } from 'redux-orm';

import BaseModel from './BaseModel';
import ActionTypes from '../constants/ActionTypes';

export default class extends BaseModel {
  static modelName = 'BackgroundImage';

  static fields = {
    id: attr(),
    url: attr(),
    thumbnailUrls: attr(),
    projectId: fk({
      to: 'Project',
      as: 'project',
      relatedName: 'backgroundImages',
    }),
  };

  static reducer({ type, payload }, BackgroundImage) {
    switch (type) {
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        BackgroundImage.all().delete();

        payload.backgroundImages.forEach((backgroundImage) => {
          BackgroundImage.upsert(backgroundImage);
        });

        break;
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.PROJECT_CREATE_HANDLE:
        payload.backgroundImages.forEach((backgroundImage) => {
          BackgroundImage.upsert(backgroundImage);
        });

        break;
      case ActionTypes.USER_UPDATE_HANDLE:
      case ActionTypes.PROJECT_UPDATE_HANDLE:
      case ActionTypes.PROJECT_MANAGER_CREATE_HANDLE:
      case ActionTypes.BOARD_MEMBERSHIP_CREATE_HANDLE:
        if (payload.backgroundImages) {
          payload.backgroundImages.forEach((backgroundImage) => {
            BackgroundImage.upsert(backgroundImage);
          });
        }

        break;
      case ActionTypes.BACKGROUND_IMAGE_CREATE:
      case ActionTypes.BACKGROUND_IMAGE_CREATE_HANDLE:
        BackgroundImage.upsert(payload.backgroundImage);

        break;
      case ActionTypes.BACKGROUND_IMAGE_CREATE__SUCCESS:
        BackgroundImage.withId(payload.localId).delete();
        BackgroundImage.upsert(payload.backgroundImage);

        break;
      case ActionTypes.BACKGROUND_IMAGE_CREATE__FAILURE:
        BackgroundImage.withId(payload.localId).delete();

        break;
      case ActionTypes.BACKGROUND_IMAGE_DELETE:
        BackgroundImage.withId(payload.id).deleteWithRelated();

        break;
      case ActionTypes.BACKGROUND_IMAGE_DELETE__SUCCESS:
      case ActionTypes.BACKGROUND_IMAGE_DELETE_HANDLE: {
        const backgroundImageModel = BackgroundImage.withId(payload.backgroundImage.id);

        if (backgroundImageModel) {
          backgroundImageModel.deleteWithRelated();
        }

        break;
      }
      default:
    }
  }

  deleteRelated() {
    if (this.backgroundedProject) {
      this.backgroundedProject.update({
        backgroundType: null,
        backgroundImageId: null,
      });
    }
  }

  deleteWithRelated() {
    this.deleteRelated();
    this.delete();
  }
}
