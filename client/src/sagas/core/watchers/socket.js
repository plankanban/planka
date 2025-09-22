/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { eventChannel } from 'redux-saga';
import { all, call, cancelled, put, take, takeEvery } from 'redux-saga/effects';

import services from '../services';
import entryActions from '../../../entry-actions';
import api, { socket } from '../../../api';
import EntryActionTypes from '../../../constants/EntryActionTypes';

const createSocketEventsChannel = () =>
  eventChannel((emit) => {
    const handleDisconnect = () => {
      emit(entryActions.handleSocketDisconnect());
    };

    const handleReconnect = () => {
      emit(entryActions.handleSocketReconnect());
    };

    const handleLogout = () => {
      emit(entryActions.logout(false));
    };

    const handleConfigUpdate = ({ item }) => {
      emit(entryActions.handleConfigUpdate(item));
    };

    const handleWebhookCreate = ({ item }) => {
      emit(entryActions.handleWebhookCreate(item));
    };

    const handleWebhookUpdate = ({ item }) => {
      emit(entryActions.handleWebhookUpdate(item));
    };

    const handleWebhookDelete = ({ item }) => {
      emit(entryActions.handleWebhookDelete(item));
    };

    const handleUserCreate = ({ item }) => {
      emit(entryActions.handleUserCreate(item));
    };

    const handleUserUpdate = ({ item }) => {
      emit(entryActions.handleUserUpdate(item));
    };

    const handleUserDelete = ({ item }) => {
      emit(entryActions.handleUserDelete(item));
    };

    const handleProjectCreate = ({ item }) => {
      emit(entryActions.handleProjectCreate(item));
    };

    const handleProjectUpdate = ({ item }) => {
      emit(entryActions.handleProjectUpdate(item));
    };

    const handleProjectDelete = ({ item }) => {
      emit(entryActions.handleProjectDelete(item));
    };

    const handleProjectManagerCreate = ({ item, included: { users } }) => {
      emit(entryActions.handleProjectManagerCreate(item, users));
    };

    const handleProjectManagerDelete = ({ item }) => {
      emit(entryActions.handleProjectManagerDelete(item));
    };

    const handleBackgroundImageCreate = ({ item, requestId }) => {
      emit(entryActions.handleBackgroundImageCreate(item, requestId));
    };

    const handleBackgroundImageDelete = ({ item }) => {
      emit(entryActions.handleBackgroundImageDelete(item));
    };

    const handleBaseCustomFieldGroupCreate = ({ item }) => {
      emit(entryActions.handleBaseCustomFieldGroupCreate(item));
    };

    const handleBaseCustomFieldGroupUpdate = ({ item }) => {
      emit(entryActions.handleBaseCustomFieldGroupUpdate(item));
    };

    const handleBaseCustomFieldGroupDelete = ({ item }) => {
      emit(entryActions.handleBaseCustomFieldGroupDelete(item));
    };

    const handleBoardCreate = ({ item, included: { boardMemberships }, requestId }) => {
      emit(entryActions.handleBoardCreate(item, boardMemberships, requestId));
    };

    const handleBoardUpdate = ({ item }) => {
      emit(entryActions.handleBoardUpdate(item));
    };

    const handleBoardDelete = ({ item }) => {
      emit(entryActions.handleBoardDelete(item));
    };

    const handleBoardMembershipCreate = ({ item, included: { users } = {} }) => {
      emit(entryActions.handleBoardMembershipCreate(item, users));
    };

    const handleBoardMembershipUpdate = ({ item }) => {
      emit(entryActions.handleBoardMembershipUpdate(item));
    };

    const handleBoardMembershipDelete = ({ item }) => {
      emit(entryActions.handleBoardMembershipDelete(item));
    };

    const handleListCreate = ({ item }) => {
      emit(entryActions.handleListCreate(item));
    };

    const handleListUpdate = ({ item }) => {
      emit(entryActions.handleListUpdate(item));
    };

    const handleListClear = ({ item }) => {
      emit(entryActions.handleListClear(item));
    };

    const handleListDelete = api.makeHandleListDelete(({ item, included: { cards } }) => {
      emit(entryActions.handleListDelete(item, cards));
    });

    const handleLabelCreate = ({ item }) => {
      emit(entryActions.handleLabelCreate(item));
    };

    const handleLabelUpdate = ({ item }) => {
      emit(entryActions.handleLabelUpdate(item));
    };

    const handleLabelDelete = ({ item }) => {
      emit(entryActions.handleLabelDelete(item));
    };

    const handleCardsUpdate = api.makeHandleCardsUpdate(
      ({ items, included: { activities } = {} }) => {
        emit(entryActions.handleCardsUpdate(items, activities));
      },
    );

    const handleCardCreate = api.makeHandleCardCreate(({ item }) => {
      emit(entryActions.handleCardCreate(item));
    });

    const handleCardUpdate = api.makeHandleCardUpdate(({ item }) => {
      emit(entryActions.handleCardUpdate(item));
    });

    const handleCardDelete = api.makeHandleCardDelete(({ item }) => {
      emit(entryActions.handleCardDelete(item));
    });

    const handleUserToCardAdd = ({ item }) => {
      emit(entryActions.handleUserToCardAdd(item));
    };

    const handleUserFromCardRemove = ({ item }) => {
      emit(entryActions.handleUserFromCardRemove(item));
    };

    const handleLabelToCardAdd = ({ item }) => {
      emit(entryActions.handleLabelToCardAdd(item));
    };

    const handleLabelFromCardRemove = ({ item }) => {
      emit(entryActions.handleLabelFromCardRemove(item));
    };

    const handleTaskListCreate = ({ item }) => {
      emit(entryActions.handleTaskListCreate(item));
    };

    const handleTaskListUpdate = ({ item }) => {
      emit(entryActions.handleTaskListUpdate(item));
    };

    const handleTaskListDelete = ({ item }) => {
      emit(entryActions.handleTaskListDelete(item));
    };

    const handleTaskCreate = ({ item }) => {
      emit(entryActions.handleTaskCreate(item));
    };

    const handleTaskUpdate = ({ item }) => {
      emit(entryActions.handleTaskUpdate(item));
    };

    const handleTaskDelete = ({ item }) => {
      emit(entryActions.handleTaskDelete(item));
    };

    const handleAttachmentCreate = api.makeHandleAttachmentCreate(({ item, requestId }) => {
      emit(entryActions.handleAttachmentCreate(item, requestId));
    });

    const handleAttachmentUpdate = api.makeHandleAttachmentUpdate(({ item }) => {
      emit(entryActions.handleAttachmentUpdate(item));
    });

    const handleAttachmentDelete = api.makeHandleAttachmentDelete(({ item }) => {
      emit(entryActions.handleAttachmentDelete(item));
    });

    const handleCustomFieldGroupCreate = ({ item }) => {
      emit(entryActions.handleCustomFieldGroupCreate(item));
    };

    const handleCustomFieldGroupUpdate = ({ item }) => {
      emit(entryActions.handleCustomFieldGroupUpdate(item));
    };

    const handleCustomFieldGroupDelete = ({ item }) => {
      emit(entryActions.handleCustomFieldGroupDelete(item));
    };

    const handleCustomFieldCreate = ({ item }) => {
      emit(entryActions.handleCustomFieldCreate(item));
    };

    const handleCustomFieldUpdate = ({ item }) => {
      emit(entryActions.handleCustomFieldUpdate(item));
    };

    const handleCustomFieldDelete = ({ item }) => {
      emit(entryActions.handleCustomFieldDelete(item));
    };

    const handleCustomFieldValueUpdate = ({ item }) => {
      emit(entryActions.handleCustomFieldValueUpdate(item));
    };

    const handleCustomFieldValueDelete = ({ item }) => {
      emit(entryActions.handleCustomFieldValueDelete(item));
    };

    const handleCommentCreate = api.makeHandleCommentCreate(({ item, included: { users } }) => {
      emit(entryActions.handleCommentCreate(item, users));
    });

    const handleCommentUpdate = api.makeHandleCommentUpdate(({ item }) => {
      emit(entryActions.handleCommentUpdate(item));
    });

    const handleCommentDelete = api.makeHandleCommentDelete(({ item }) => {
      emit(entryActions.handleCommentDelete(item));
    });

    const handleActivityCreate = api.makeHandleActivityCreate(({ item }) => {
      emit(entryActions.handleActivityCreate(item));
    });

    const handleNotificationCreate = api.makeHandleNotificationCreate(
      ({ item, included: { users } }) => {
        emit(entryActions.handleNotificationCreate(item, users));
      },
    );

    const handleNotificationUpdate = api.makeHandleNotificationUpdate(({ item }) => {
      emit(entryActions.handleNotificationDelete(item));
    });

    const handleNotificationServiceCreate = ({ item }) => {
      emit(entryActions.handleNotificationServiceCreate(item));
    };

    const handleNotificationServiceUpdate = ({ item }) => {
      emit(entryActions.handleNotificationServiceUpdate(item));
    };

    const handleNotificationServiceDelete = ({ item }) => {
      emit(entryActions.handleNotificationServiceDelete(item));
    };

    socket.on('disconnect', handleDisconnect);
    socket.on('reconnect', handleReconnect);

    socket.on('logout', handleLogout);

    socket.on('configUpdate', handleConfigUpdate);

    socket.on('webhookCreate', handleWebhookCreate);
    socket.on('webhookUpdate', handleWebhookUpdate);
    socket.on('webhookDelete', handleWebhookDelete);

    socket.on('userCreate', handleUserCreate);
    socket.on('userUpdate', handleUserUpdate);
    socket.on('userDelete', handleUserDelete);

    socket.on('projectCreate', handleProjectCreate);
    socket.on('projectUpdate', handleProjectUpdate);
    socket.on('projectDelete', handleProjectDelete);

    socket.on('projectManagerCreate', handleProjectManagerCreate);
    socket.on('projectManagerDelete', handleProjectManagerDelete);

    socket.on('backgroundImageCreate', handleBackgroundImageCreate);
    socket.on('backgroundImageDelete', handleBackgroundImageDelete);

    socket.on('baseCustomFieldGroupCreate', handleBaseCustomFieldGroupCreate);
    socket.on('baseCustomFieldGroupUpdate', handleBaseCustomFieldGroupUpdate);
    socket.on('baseCustomFieldGroupDelete', handleBaseCustomFieldGroupDelete);

    socket.on('boardCreate', handleBoardCreate);
    socket.on('boardUpdate', handleBoardUpdate);
    socket.on('boardDelete', handleBoardDelete);

    socket.on('boardMembershipCreate', handleBoardMembershipCreate);
    socket.on('boardMembershipUpdate', handleBoardMembershipUpdate);
    socket.on('boardMembershipDelete', handleBoardMembershipDelete);

    socket.on('listCreate', handleListCreate);
    socket.on('listUpdate', handleListUpdate);
    socket.on('listClear', handleListClear);
    socket.on('listDelete', handleListDelete);

    socket.on('labelCreate', handleLabelCreate);
    socket.on('labelUpdate', handleLabelUpdate);
    socket.on('labelDelete', handleLabelDelete);

    socket.on('cardsUpdate', handleCardsUpdate);
    socket.on('cardCreate', handleCardCreate);
    socket.on('cardUpdate', handleCardUpdate);
    socket.on('cardDelete', handleCardDelete);

    socket.on('cardMembershipCreate', handleUserToCardAdd);
    socket.on('cardMembershipDelete', handleUserFromCardRemove);

    socket.on('cardLabelCreate', handleLabelToCardAdd);
    socket.on('cardLabelDelete', handleLabelFromCardRemove);

    socket.on('taskListCreate', handleTaskListCreate);
    socket.on('taskListUpdate', handleTaskListUpdate);
    socket.on('taskListDelete', handleTaskListDelete);

    socket.on('taskCreate', handleTaskCreate);
    socket.on('taskUpdate', handleTaskUpdate);
    socket.on('taskDelete', handleTaskDelete);

    socket.on('attachmentCreate', handleAttachmentCreate);
    socket.on('attachmentUpdate', handleAttachmentUpdate);
    socket.on('attachmentDelete', handleAttachmentDelete);

    socket.on('customFieldGroupCreate', handleCustomFieldGroupCreate);
    socket.on('customFieldGroupUpdate', handleCustomFieldGroupUpdate);
    socket.on('customFieldGroupDelete', handleCustomFieldGroupDelete);

    socket.on('customFieldCreate', handleCustomFieldCreate);
    socket.on('customFieldUpdate', handleCustomFieldUpdate);
    socket.on('customFieldDelete', handleCustomFieldDelete);

    socket.on('customFieldValueUpdate', handleCustomFieldValueUpdate);
    socket.on('customFieldValueDelete', handleCustomFieldValueDelete);

    socket.on('commentCreate', handleCommentCreate);
    socket.on('commentUpdate', handleCommentUpdate);
    socket.on('commentDelete', handleCommentDelete);

    socket.on('actionCreate', handleActivityCreate);

    socket.on('notificationCreate', handleNotificationCreate);
    socket.on('notificationUpdate', handleNotificationUpdate);

    socket.on('notificationServiceCreate', handleNotificationServiceCreate);
    socket.on('notificationServiceUpdate', handleNotificationServiceUpdate);
    socket.on('notificationServiceDelete', handleNotificationServiceDelete);

    return () => {
      socket.off('disconnect', handleDisconnect);
      socket.off('reconnect', handleReconnect);

      socket.off('logout', handleLogout);

      socket.off('configUpdate', handleConfigUpdate);

      socket.off('webhookCreate', handleWebhookCreate);
      socket.off('webhookUpdate', handleWebhookUpdate);
      socket.off('webhookDelete', handleWebhookDelete);

      socket.off('userCreate', handleUserCreate);
      socket.off('userUpdate', handleUserUpdate);
      socket.off('userDelete', handleUserDelete);

      socket.off('projectCreate', handleProjectCreate);
      socket.off('projectUpdate', handleProjectUpdate);
      socket.off('projectDelete', handleProjectDelete);

      socket.off('projectManagerCreate', handleProjectManagerCreate);
      socket.off('projectManagerDelete', handleProjectManagerDelete);

      socket.off('backgroundImageCreate', handleBackgroundImageCreate);
      socket.off('backgroundImageDelete', handleBackgroundImageDelete);

      socket.off('baseCustomFieldGroupCreate', handleBaseCustomFieldGroupCreate);
      socket.off('baseCustomFieldGroupUpdate', handleBaseCustomFieldGroupUpdate);
      socket.off('baseCustomFieldGroupDelete', handleBaseCustomFieldGroupDelete);

      socket.off('boardCreate', handleBoardCreate);
      socket.off('boardUpdate', handleBoardUpdate);
      socket.off('boardDelete', handleBoardDelete);

      socket.off('boardMembershipCreate', handleBoardMembershipCreate);
      socket.off('boardMembershipUpdate', handleBoardMembershipUpdate);
      socket.off('boardMembershipDelete', handleBoardMembershipDelete);

      socket.off('listCreate', handleListCreate);
      socket.off('listUpdate', handleListUpdate);
      socket.off('listClear', handleListClear);
      socket.off('listDelete', handleListDelete);

      socket.off('labelCreate', handleLabelCreate);
      socket.off('labelUpdate', handleLabelUpdate);
      socket.off('labelDelete', handleLabelDelete);

      socket.off('cardsUpdate', handleCardsUpdate);
      socket.off('cardCreate', handleCardCreate);
      socket.off('cardUpdate', handleCardUpdate);
      socket.off('cardDelete', handleCardDelete);

      socket.off('cardMembershipCreate', handleUserToCardAdd);
      socket.off('cardMembershipDelete', handleUserFromCardRemove);

      socket.off('cardLabelCreate', handleLabelToCardAdd);
      socket.off('cardLabelDelete', handleLabelFromCardRemove);

      socket.off('taskListCreate', handleTaskListCreate);
      socket.off('taskListUpdate', handleTaskListUpdate);
      socket.off('taskListDelete', handleTaskListDelete);

      socket.off('taskCreate', handleTaskCreate);
      socket.off('taskUpdate', handleTaskUpdate);
      socket.off('taskDelete', handleTaskDelete);

      socket.off('attachmentCreate', handleAttachmentCreate);
      socket.off('attachmentUpdate', handleAttachmentUpdate);
      socket.off('attachmentDelete', handleAttachmentDelete);

      socket.off('customFieldGroupCreate', handleCustomFieldGroupCreate);
      socket.off('customFieldGroupUpdate', handleCustomFieldGroupUpdate);
      socket.off('customFieldGroupDelete', handleCustomFieldGroupDelete);

      socket.off('customFieldCreate', handleCustomFieldCreate);
      socket.off('customFieldUpdate', handleCustomFieldUpdate);
      socket.off('customFieldDelete', handleCustomFieldDelete);

      socket.off('customFieldValueUpdate', handleCustomFieldValueUpdate);
      socket.off('customFieldValueDelete', handleCustomFieldValueDelete);

      socket.off('commentCreate', handleCommentCreate);
      socket.off('commentUpdate', handleCommentUpdate);
      socket.off('commentDelete', handleCommentDelete);

      socket.off('actionCreate', handleActivityCreate);

      socket.off('notificationCreate', handleNotificationCreate);
      socket.off('notificationUpdate', handleNotificationUpdate);

      socket.off('notificationServiceCreate', handleNotificationServiceCreate);
      socket.off('notificationServiceUpdate', handleNotificationServiceUpdate);
      socket.off('notificationServiceDelete', handleNotificationServiceDelete);
    };
  });

export default function* socketWatchers() {
  yield all([
    yield takeEvery(EntryActionTypes.SOCKET_DISCONNECT_HANDLE, () =>
      services.handleSocketDisconnect(),
    ),
    yield takeEvery(EntryActionTypes.SOCKET_RECONNECT_HANDLE, () =>
      services.handleSocketReconnect(),
    ),
  ]);

  const socketEventsChannel = yield call(createSocketEventsChannel);

  try {
    while (true) {
      const action = yield take(socketEventsChannel);

      yield put(action);
    }
  } finally {
    if (yield cancelled()) {
      socketEventsChannel.close();
    }
  }
}
