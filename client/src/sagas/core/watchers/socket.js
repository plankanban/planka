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

    const handleUserCreate = api.makeHandleUserCreate(({ item }) => {
      emit(entryActions.handleUserCreate(item));
    });

    const handleUserUpdate = api.makeHandleUserUpdate(({ item }) => {
      emit(entryActions.handleUserUpdate(item));
    });

    const handleUserDelete = api.makeHandleUserDelete(({ item }) => {
      emit(entryActions.handleUserDelete(item));
    });

    const handleProjectCreate = ({ item }) => {
      emit(entryActions.handleProjectCreate(item));
    };

    const handleProjectUpdate = ({ item }) => {
      emit(entryActions.handleProjectUpdate(item));
    };

    const handleProjectDelete = ({ item }) => {
      emit(entryActions.handleProjectDelete(item));
    };

    const handleProjectManagerCreate = api.makeHandleProjectManagerCreate(({ item }) => {
      emit(entryActions.handleProjectManagerCreate(item));
    });

    const handleProjectManagerDelete = api.makeHandleProjectManagerDelete(({ item }) => {
      emit(entryActions.handleProjectManagerDelete(item));
    });

    const handleBoardCreate = ({ item, requestId }) => {
      emit(entryActions.handleBoardCreate(item, requestId));
    };

    const handleBoardUpdate = ({ item }) => {
      emit(entryActions.handleBoardUpdate(item));
    };

    const handleBoardDelete = ({ item }) => {
      emit(entryActions.handleBoardDelete(item));
    };

    const handleBoardMembershipCreate = api.makeHandleBoardMembershipCreate(({ item }) => {
      emit(entryActions.handleBoardMembershipCreate(item));
    });

    const handleBoardMembershipUpdate = api.makeHandleBoardMembershipUpdate(({ item }) => {
      emit(entryActions.handleBoardMembershipUpdate(item));
    });

    const handleBoardMembershipDelete = api.makeHandleBoardMembershipDelete(({ item }) => {
      emit(entryActions.handleBoardMembershipDelete(item));
    });

    const handleListCreate = ({ item }) => {
      emit(entryActions.handleListCreate(item));
    };

    const handleListUpdate = ({ item }) => {
      emit(entryActions.handleListUpdate(item));
    };

    const handleListSort = api.makeHandleListSort(({ item, included: { cards } }) => {
      emit(entryActions.handleListSort(item, cards));
    });

    const handleListDelete = ({ item }) => {
      emit(entryActions.handleListDelete(item));
    };

    const handleLabelCreate = ({ item }) => {
      emit(entryActions.handleLabelCreate(item));
    };

    const handleLabelUpdate = ({ item }) => {
      emit(entryActions.handleLabelUpdate(item));
    };

    const handleLabelDelete = ({ item }) => {
      emit(entryActions.handleLabelDelete(item));
    };

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

    const handleActivityCreate = api.makeHandleActivityCreate(({ item }) => {
      emit(entryActions.handleActivityCreate(item));
    });

    const handleActivityUpdate = api.makeHandleActivityUpdate(({ item }) => {
      emit(entryActions.handleActivityUpdate(item));
    });

    const handleActivityDelete = api.makeHandleActivityDelete(({ item }) => {
      emit(entryActions.handleActivityDelete(item));
    });

    const handleNotificationCreate = api.makeHandleNotificationCreate(({ item }) => {
      emit(entryActions.handleNotificationCreate(item));
    });

    const handleNotificationUpdate = api.makeHandleNotificationUpdate(({ item }) => {
      emit(entryActions.handleNotificationDelete(item));
    });

    socket.on('disconnect', handleDisconnect);
    socket.on('reconnect', handleReconnect);

    socket.on('logout', handleLogout);

    socket.on('userCreate', handleUserCreate);
    socket.on('userUpdate', handleUserUpdate);
    socket.on('userDelete', handleUserDelete);

    socket.on('projectCreate', handleProjectCreate);
    socket.on('projectUpdate', handleProjectUpdate);
    socket.on('projectDelete', handleProjectDelete);

    socket.on('projectManagerCreate', handleProjectManagerCreate);
    socket.on('projectManagerDelete', handleProjectManagerDelete);

    socket.on('boardCreate', handleBoardCreate);
    socket.on('boardUpdate', handleBoardUpdate);
    socket.on('boardDelete', handleBoardDelete);

    socket.on('boardMembershipCreate', handleBoardMembershipCreate);
    socket.on('boardMembershipUpdate', handleBoardMembershipUpdate);
    socket.on('boardMembershipDelete', handleBoardMembershipDelete);

    socket.on('listCreate', handleListCreate);
    socket.on('listUpdate', handleListUpdate);
    socket.on('listSort', handleListSort);
    socket.on('listDelete', handleListDelete);

    socket.on('labelCreate', handleLabelCreate);
    socket.on('labelUpdate', handleLabelUpdate);
    socket.on('labelDelete', handleLabelDelete);

    socket.on('cardCreate', handleCardCreate);
    socket.on('cardUpdate', handleCardUpdate);
    socket.on('cardDelete', handleCardDelete);

    socket.on('cardMembershipCreate', handleUserToCardAdd);
    socket.on('cardMembershipDelete', handleUserFromCardRemove);

    socket.on('cardLabelCreate', handleLabelToCardAdd);
    socket.on('cardLabelDelete', handleLabelFromCardRemove);

    socket.on('taskCreate', handleTaskCreate);
    socket.on('taskUpdate', handleTaskUpdate);
    socket.on('taskDelete', handleTaskDelete);

    socket.on('attachmentCreate', handleAttachmentCreate);
    socket.on('attachmentUpdate', handleAttachmentUpdate);
    socket.on('attachmentDelete', handleAttachmentDelete);

    socket.on('actionCreate', handleActivityCreate);
    socket.on('actionUpdate', handleActivityUpdate);
    socket.on('actionDelete', handleActivityDelete);

    socket.on('notificationCreate', handleNotificationCreate);
    socket.on('notificationUpdate', handleNotificationUpdate);

    return () => {
      socket.off('disconnect', handleDisconnect);
      socket.off('reconnect', handleReconnect);

      socket.off('logout', handleLogout);

      socket.off('userCreate', handleUserCreate);
      socket.off('userUpdate', handleUserUpdate);
      socket.off('userDelete', handleUserDelete);

      socket.off('projectCreate', handleProjectCreate);
      socket.off('projectUpdate', handleProjectUpdate);
      socket.off('projectDelete', handleProjectDelete);

      socket.off('projectManagerCreate', handleProjectManagerCreate);
      socket.off('projectManagerDelete', handleProjectManagerDelete);

      socket.off('boardCreate', handleBoardCreate);
      socket.off('boardUpdate', handleBoardUpdate);
      socket.off('boardDelete', handleBoardDelete);

      socket.off('boardMembershipCreate', handleBoardMembershipCreate);
      socket.off('boardMembershipUpdate', handleBoardMembershipUpdate);
      socket.off('boardMembershipDelete', handleBoardMembershipDelete);

      socket.off('listCreate', handleListCreate);
      socket.off('listUpdate', handleListUpdate);
      socket.off('listSort', handleListSort);
      socket.off('listDelete', handleListDelete);

      socket.off('labelCreate', handleLabelCreate);
      socket.off('labelUpdate', handleLabelUpdate);
      socket.off('labelDelete', handleLabelDelete);

      socket.off('cardCreate', handleCardCreate);
      socket.off('cardUpdate', handleCardUpdate);
      socket.off('cardDelete', handleCardDelete);

      socket.off('cardMembershipCreate', handleUserToCardAdd);
      socket.off('cardMembershipDelete', handleUserFromCardRemove);

      socket.off('cardLabelCreate', handleLabelToCardAdd);
      socket.off('cardLabelDelete', handleLabelFromCardRemove);

      socket.off('taskCreate', handleTaskCreate);
      socket.off('taskUpdate', handleTaskUpdate);
      socket.off('taskDelete', handleTaskDelete);

      socket.off('attachmentCreate', handleAttachmentCreate);
      socket.off('attachmentUpdate', handleAttachmentUpdate);
      socket.off('attachmentDelete', handleAttachmentDelete);

      socket.off('actionCreate', handleActivityCreate);
      socket.off('actionUpdate', handleActivityUpdate);
      socket.off('actionDelete', handleActivityDelete);

      socket.off('notificationCreate', handleNotificationCreate);
      socket.off('notificationUpdate', handleNotificationUpdate);
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
