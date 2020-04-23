import { eventChannel } from 'redux-saga';
import { call, cancelled, take } from 'redux-saga/effects';

import {
  createActionReceivedService,
  createAttachmentReceivedService,
  createBoardReceivedService,
  createCardLabelReceivedService,
  createCardMembershipReceivedService,
  createCardReceivedService,
  createLabelReceivedService,
  createListReceivedService,
  createNotificationReceivedService,
  createProjectMembershipReceivedService,
  createProjectReceivedService,
  createTaskReceivedService,
  createUserReceivedService,
  deleteActionReceivedService,
  deleteAttachmentReceivedService,
  deleteCardLabelReceivedService,
  deleteCardMembershipReceivedService,
  deleteCardReceivedService,
  deleteBoardReceivedService,
  deleteLabelReceivedService,
  deleteListReceivedService,
  deleteNotificationReceivedService,
  deleteProjectMembershipReceivedService,
  deleteProjectReceivedService,
  deleteTaskReceivedService,
  deleteUserReceivedService,
  socketDisconnectedService,
  socketReconnectedService,
  updateActionReceivedService,
  updateAttachmentReceivedService,
  updateBoardReceivedService,
  updateCardReceivedService,
  updateLabelReceivedService,
  updateListReceivedService,
  updateProjectReceivedService,
  updateTaskReceivedService,
  updateUserReceivedService,
} from '../services';
import api, { socket } from '../../../api';

const createSocketEventsChannel = () =>
  eventChannel((emit) => {
    const handleReconnect = () => {
      emit([socketReconnectedService]);
    };

    const handleUserCreate = ({ item }) => {
      emit([createUserReceivedService, item]);
    };

    const handleUserUpdate = ({ item }) => {
      emit([updateUserReceivedService, item]);
    };

    const handleUserDelete = ({ item }) => {
      emit([deleteUserReceivedService, item]);
    };

    const handleProjectCreate = ({ item, included: { users, projectMemberships, boards } }) => {
      emit([createProjectReceivedService, item, users, projectMemberships, boards]);
    };

    const handleProjectUpdate = ({ item }) => {
      emit([updateProjectReceivedService, item]);
    };

    const handleProjectDelete = ({ item }) => {
      emit([deleteProjectReceivedService, item]);
    };

    const handleProjectMembershipCreate = ({ item, included: { users } }) => {
      emit([createProjectMembershipReceivedService, item, users[0]]);
    };

    const handleProjectMembershipDelete = ({ item }) => {
      emit([deleteProjectMembershipReceivedService, item]);
    };

    const handleBoardCreate = ({ item, included: { lists, labels } }) => {
      emit([createBoardReceivedService, item, lists, labels]);
    };

    const handleBoardUpdate = ({ item }) => {
      emit([updateBoardReceivedService, item]);
    };

    const handleBoardDelete = ({ item }) => {
      emit([deleteBoardReceivedService, item]);
    };

    const handleListCreate = ({ item }) => {
      emit([createListReceivedService, item]);
    };

    const handleListUpdate = ({ item }) => {
      emit([updateListReceivedService, item]);
    };

    const handleListDelete = ({ item }) => {
      emit([deleteListReceivedService, item]);
    };

    const handleLabelCreate = ({ item }) => {
      emit([createLabelReceivedService, item]);
    };

    const handleLabelUpdate = ({ item }) => {
      emit([updateLabelReceivedService, item]);
    };

    const handleLabelDelete = ({ item }) => {
      emit([deleteLabelReceivedService, item]);
    };

    const handleCardCreate = api.makeHandleCardCreate(({ item }) => {
      emit([createCardReceivedService, item]);
    });

    const handleCardUpdate = api.makeHandleCardUpdate(({ item }) => {
      emit([updateCardReceivedService, item]);
    });

    const handleCardDelete = api.makeHandleCardDelete(({ item }) => {
      emit([deleteCardReceivedService, item]);
    });

    const handleCardMembershipCreate = ({ item }) => {
      emit([createCardMembershipReceivedService, item]);
    };

    const handleCardMembershipDelete = ({ item }) => {
      emit([deleteCardMembershipReceivedService, item]);
    };

    const handleCardLabelCreate = ({ item }) => {
      emit([createCardLabelReceivedService, item]);
    };

    const handleCardLabelDelete = ({ item }) => {
      emit([deleteCardLabelReceivedService, item]);
    };

    const handleTaskCreate = ({ item }) => {
      emit([createTaskReceivedService, item]);
    };

    const handleTaskUpdate = ({ item }) => {
      emit([updateTaskReceivedService, item]);
    };

    const handleTaskDelete = ({ item }) => {
      emit([deleteTaskReceivedService, item]);
    };

    const handleAttachmentCreate = api.makeHandleAttachmentCreate(({ item, requestId }) => {
      emit([createAttachmentReceivedService, item, requestId]);
    });

    const handleAttachmentUpdate = api.makeHandleAttachmentUpdate(({ item }) => {
      emit([updateAttachmentReceivedService, item]);
    });

    const handleAttachmentDelete = api.makeHandleAttachmentDelete(({ item }) => {
      emit([deleteAttachmentReceivedService, item]);
    });

    const handleActionCreate = api.makeHandleActionCreate(({ item }) => {
      emit([createActionReceivedService, item]);
    });

    const handleActionUpdate = api.makeHandleActionUpdate(({ item }) => {
      emit([updateActionReceivedService, item]);
    });

    const handleActionDelete = api.makeHandleActionDelete(({ item }) => {
      emit([deleteActionReceivedService, item]);
    });

    const handleNotificationCreate = api.makeHandleNotificationCreate(
      ({ item, included: { users, cards, actions } }) => {
        emit([createNotificationReceivedService, item, users[0], cards[0], actions[0]]);
      },
    );

    const handleNotificationDelete = ({ item }) => {
      emit([deleteNotificationReceivedService, item]);
    };

    const handleDisconnect = () => {
      socket.off('disconnect', handleDisconnect);

      emit([socketDisconnectedService]);

      socket.on('reconnect', handleReconnect);
    };

    socket.on('disconnect', handleDisconnect);

    socket.on('userCreate', handleUserCreate);
    socket.on('userUpdate', handleUserUpdate);
    socket.on('userDelete', handleUserDelete);

    socket.on('projectCreate', handleProjectCreate);
    socket.on('projectUpdate', handleProjectUpdate);
    socket.on('projectDelete', handleProjectDelete);

    socket.on('projectMembershipCreate', handleProjectMembershipCreate);
    socket.on('projectMembershipDelete', handleProjectMembershipDelete);

    socket.on('boardCreate', handleBoardCreate);
    socket.on('boardUpdate', handleBoardUpdate);
    socket.on('boardDelete', handleBoardDelete);

    socket.on('listCreate', handleListCreate);
    socket.on('listUpdate', handleListUpdate);
    socket.on('listDelete', handleListDelete);

    socket.on('labelCreate', handleLabelCreate);
    socket.on('labelUpdate', handleLabelUpdate);
    socket.on('labelDelete', handleLabelDelete);

    socket.on('cardCreate', handleCardCreate);
    socket.on('cardUpdate', handleCardUpdate);
    socket.on('cardDelete', handleCardDelete);

    socket.on('cardMembershipCreate', handleCardMembershipCreate);
    socket.on('cardMembershipDelete', handleCardMembershipDelete);

    socket.on('cardLabelCreate', handleCardLabelCreate);
    socket.on('cardLabelDelete', handleCardLabelDelete);

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

      socket.off('projectMembershipCreate', handleProjectMembershipCreate);
      socket.off('projectMembershipDelete', handleProjectMembershipDelete);

      socket.off('boardCreate', handleBoardCreate);
      socket.off('boardUpdate', handleBoardUpdate);
      socket.off('boardDelete', handleBoardDelete);

      socket.off('listCreate', handleListCreate);
      socket.off('listUpdate', handleListUpdate);
      socket.off('listDelete', handleListDelete);

      socket.off('labelCreate', handleLabelCreate);
      socket.off('labelUpdate', handleLabelUpdate);
      socket.off('labelDelete', handleLabelDelete);

      socket.off('cardCreate', handleCardCreate);
      socket.off('cardUpdate', handleCardUpdate);
      socket.off('cardDelete', handleCardDelete);

      socket.off('cardMembershipCreate', handleCardMembershipCreate);
      socket.off('cardMembershipDelete', handleCardMembershipDelete);

      socket.off('cardLabelCreate', handleCardLabelCreate);
      socket.off('cardLabelDelete', handleCardLabelDelete);

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

export default function* () {
  const socketEventsChannel = yield call(createSocketEventsChannel);

  try {
    while (true) {
      const args = yield take(socketEventsChannel);

      yield call(...args);
    }
  } finally {
    if (yield cancelled()) {
      socketEventsChannel.close();
    }
  }
}
