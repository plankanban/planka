import { eventChannel } from 'redux-saga';
import { all, call, cancelled, put, take, takeEvery } from 'redux-saga/effects';

import { handleSocketDisconnectService, handleSocketReconnectService } from '../services';
import {
  handleProjectManagerCreate as handleProjectManagerCreateAction,
  handleProjectManagerDelete as handleProjectManagerDeleteAction,
  handleBoardCreate as handleBoardCreateAction,
  handleBoardUpdate as handleBoardUpdateAction,
  handleBoardDelete as handleBoardDeleteAction,
  handleBoardMembershipCreate as handleBoardMembershipCreateAction,
  handleBoardMembershipDelete as handleBoardMembershipDeleteAction,
  handleListCreate as handleListCreateAction,
  handleListUpdate as handleListUpdateAction,
  handleListDelete as handleListDeleteAction,
  handleLabelCreate as handleLabelCreateAction,
  handleLabelUpdate as handleLabelUpdateAction,
  handleLabelDelete as handleLabelDeleteAction,
  handleCardCreate as handleCardCreateAction,
  handleCardUpdate as handleCardUpdateAction,
  handleCardDelete as handleCardDeleteAction,
  handleUserToCardAdd as handleUserToCardAddAction,
  handleUserFromCardRemove as handleUserFromCardRemoveAction,
  handleLabelToCardAdd as handleLabelToCardAddAction,
  handleLabelFromCardRemove as handleLabelFromCardRemoveAction,
  handleTaskCreate as handleTaskCreateAction,
  handleTaskUpdate as handleTaskUpdateAction,
  handleTaskDelete as handleTaskDeleteAction,
  handleAttachmentCreate as handleAttachmentCreateAction,
  handleAttachmentUpdate as handleAttachmentUpdateAction,
  handleAttachmentDelete as handleAttachmentDeleteAction,
  handleActionCreate as handleActionCreateAction,
  handleActionUpdate as handleActionUpdateAction,
  handleActionDelete as handleActionDeleteAction,
  handleNotificationCreate as handleNotificationCreateAction,
  handleNotificationDelete as handleNotificationDeleteAction,
  handleSocketDisconnect as handleSocketDisconnectAction,
  handleUserCreate as handleUserCreateAction,
  handleUserUpdate as handleUserUpdateAction,
  handleUserDelete as handleUserDeleteAction,
  handleProjectCreate as handleProjectCreateAction,
  handleProjectUpdate as handleProjectUpdateAction,
  handleProjectDelete as handleProjectDeleteAction,
  handleSocketReconnect as handleSocketReconnectAction,
} from '../../../actions/entry';
import api, { socket } from '../../../api';
import EntryActionTypes from '../../../constants/EntryActionTypes';

const createSocketEventsChannel = () =>
  eventChannel((emit) => {
    const handleDisconnect = () => {
      emit(handleSocketDisconnectAction());
    };

    const handleReconnect = () => {
      emit(handleSocketReconnectAction());
    };

    const handleUserCreate = ({ item }) => {
      emit(handleUserCreateAction(item));
    };

    const handleUserUpdate = ({ item }) => {
      emit(handleUserUpdateAction(item));
    };

    const handleUserDelete = ({ item }) => {
      emit(handleUserDeleteAction(item));
    };

    const handleProjectCreate = ({ item }) => {
      emit(handleProjectCreateAction(item));
    };

    const handleProjectUpdate = ({ item }) => {
      emit(handleProjectUpdateAction(item));
    };

    const handleProjectDelete = ({ item }) => {
      emit(handleProjectDeleteAction(item));
    };

    const handleProjectManagerCreate = ({ item }) => {
      emit(handleProjectManagerCreateAction(item));
    };

    const handleProjectManagerDelete = ({ item }) => {
      emit(handleProjectManagerDeleteAction(item));
    };

    const handleBoardCreate = ({ item }) => {
      emit(handleBoardCreateAction(item));
    };

    const handleBoardUpdate = ({ item }) => {
      emit(handleBoardUpdateAction(item));
    };

    const handleBoardDelete = ({ item }) => {
      emit(handleBoardDeleteAction(item));
    };

    const handleBoardMembershipCreate = ({ item }) => {
      emit(handleBoardMembershipCreateAction(item));
    };

    const handleBoardMembershipDelete = ({ item }) => {
      emit(handleBoardMembershipDeleteAction(item));
    };

    const handleListCreate = ({ item }) => {
      emit(handleListCreateAction(item));
    };

    const handleListUpdate = ({ item }) => {
      emit(handleListUpdateAction(item));
    };

    const handleListDelete = ({ item }) => {
      emit(handleListDeleteAction(item));
    };

    const handleLabelCreate = ({ item }) => {
      emit(handleLabelCreateAction(item));
    };

    const handleLabelUpdate = ({ item }) => {
      emit(handleLabelUpdateAction(item));
    };

    const handleLabelDelete = ({ item }) => {
      emit(handleLabelDeleteAction(item));
    };

    const handleCardCreate = api.makeHandleCardCreate(({ item }) => {
      emit(handleCardCreateAction(item));
    });

    const handleCardUpdate = api.makeHandleCardUpdate(({ item }) => {
      emit(handleCardUpdateAction(item));
    });

    const handleCardDelete = api.makeHandleCardDelete(({ item }) => {
      emit(handleCardDeleteAction(item));
    });

    const handleUserToCardAdd = ({ item }) => {
      emit(handleUserToCardAddAction(item));
    };

    const handleUserFromCardRemove = ({ item }) => {
      emit(handleUserFromCardRemoveAction(item));
    };

    const handleLabelToCardAdd = ({ item }) => {
      emit(handleLabelToCardAddAction(item));
    };

    const handleLabelFromCardRemove = ({ item }) => {
      emit(handleLabelFromCardRemoveAction(item));
    };

    const handleTaskCreate = ({ item }) => {
      emit(handleTaskCreateAction(item));
    };

    const handleTaskUpdate = ({ item }) => {
      emit(handleTaskUpdateAction(item));
    };

    const handleTaskDelete = ({ item }) => {
      emit(handleTaskDeleteAction(item));
    };

    const handleAttachmentCreate = api.makeHandleAttachmentCreate(({ item, requestId }) => {
      emit(handleAttachmentCreateAction(item, requestId));
    });

    const handleAttachmentUpdate = api.makeHandleAttachmentUpdate(({ item }) => {
      emit(handleAttachmentUpdateAction(item));
    });

    const handleAttachmentDelete = api.makeHandleAttachmentDelete(({ item }) => {
      emit(handleAttachmentDeleteAction(item));
    });

    const handleActionCreate = api.makeHandleActionCreate(({ item }) => {
      emit(handleActionCreateAction(item));
    });

    const handleActionUpdate = api.makeHandleActionUpdate(({ item }) => {
      emit(handleActionUpdateAction(item));
    });

    const handleActionDelete = api.makeHandleActionDelete(({ item }) => {
      emit(handleActionDeleteAction(item));
    });

    const handleNotificationCreate = ({ item }) => {
      emit(handleNotificationCreateAction(item));
    };

    const handleNotificationDelete = ({ item }) => {
      emit(handleNotificationDeleteAction(item));
    };

    socket.on('disconnect', handleDisconnect);
    socket.on('reconnect', handleReconnect);

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
    socket.on('boardMembershipDelete', handleBoardMembershipDelete);

    socket.on('listCreate', handleListCreate);
    socket.on('listUpdate', handleListUpdate);
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

    socket.on('actionCreate', handleActionCreate);
    socket.on('actionUpdate', handleActionUpdate);
    socket.on('actionDelete', handleActionDelete);

    socket.on('notificationCreate', handleNotificationCreate);
    socket.on('notificationUpdate', handleNotificationDelete);

    return () => {
      socket.off('disconnect', handleDisconnect);
      socket.off('reconnect', handleReconnect);

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
      socket.off('boardMembershipDelete', handleBoardMembershipDelete);

      socket.off('listCreate', handleListCreate);
      socket.off('listUpdate', handleListUpdate);
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

      socket.off('actionCreate', handleActionCreate);
      socket.off('actionUpdate', handleActionUpdate);
      socket.off('actionDelete', handleActionDelete);

      socket.off('notificationCreate', handleNotificationCreate);
      socket.off('notificationUpdate', handleNotificationDelete);
    };
  });

export default function* socketWatchers() {
  yield all([
    yield takeEvery(EntryActionTypes.SOCKET_DISCONNECT_HANDLE, () =>
      handleSocketDisconnectService(),
    ),
    yield takeEvery(EntryActionTypes.SOCKET_RECONNECT_HANDLE, () => handleSocketReconnectService()),
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
