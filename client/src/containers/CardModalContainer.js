import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import omit from 'lodash/omit';

import {
  actionsForCurrentCardSelector,
  attachmentsForCurrentCardSelector,
  currentCardSelector,
  isCurrentUserManagerForCurrentProjectSelector,
  isCurrentUserMemberForCurrentBoardSelector,
  labelsForCurrentBoardSelector,
  labelsForCurrentCardSelector,
  membershipsForCurrentBoardSelector,
  pathSelector,
  projectsToListsForCurrentUserSelector,
  tasksForCurrentCardSelector,
  usersForCurrentCardSelector,
} from '../selectors';
import {
  addLabelToCurrentCard,
  addUserToCurrentCard,
  createAttachmentInCurrentCard,
  createCommentActionInCurrentCard,
  createLabelInCurrentBoard,
  createTaskInCurrentCard,
  deleteAttachment,
  deleteCommentAction,
  deleteCurrentCard,
  deleteLabel,
  deleteTask,
  fetchActionsInCurrentCard,
  fetchBoard,
  moveCurrentCard,
  removeLabelFromCurrentCard,
  removeUserFromCurrentCard,
  transferCurrentCard,
  updateAttachment,
  updateCommentAction,
  updateCurrentCard,
  updateLabel,
  updateTask,
} from '../actions/entry';
import Paths from '../constants/Paths';
import CardModal from '../components/CardModal';

const mapStateToProps = (state) => {
  const { projectId } = pathSelector(state);
  const allProjectsToLists = projectsToListsForCurrentUserSelector(state);
  const isCurrentUserManager = isCurrentUserManagerForCurrentProjectSelector(state);
  const allBoardMemberships = membershipsForCurrentBoardSelector(state);
  const allLabels = labelsForCurrentBoardSelector(state);
  const isCurrentUserMember = isCurrentUserMemberForCurrentBoardSelector(state);

  const {
    name,
    description,
    dueDate,
    timer,
    isSubscribed,
    isActionsFetching,
    isAllActionsFetched,
    boardId,
    listId,
  } = currentCardSelector(state);

  const users = usersForCurrentCardSelector(state);
  const labels = labelsForCurrentCardSelector(state);
  const tasks = tasksForCurrentCardSelector(state);
  const attachments = attachmentsForCurrentCardSelector(state);
  const actions = actionsForCurrentCardSelector(state);

  return {
    name,
    description,
    dueDate,
    timer,
    isSubscribed,
    isActionsFetching,
    isAllActionsFetched,
    listId,
    boardId,
    projectId,
    users,
    labels,
    tasks,
    attachments,
    actions,
    allProjectsToLists,
    allBoardMemberships,
    allLabels,
    canEdit: isCurrentUserMember,
    canEditAllCommentActions: isCurrentUserManager,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onUpdate: updateCurrentCard,
      onMove: moveCurrentCard,
      onTransfer: transferCurrentCard,
      onDelete: deleteCurrentCard,
      onUserAdd: addUserToCurrentCard,
      onUserRemove: removeUserFromCurrentCard,
      onBoardFetch: fetchBoard,
      onLabelAdd: addLabelToCurrentCard,
      onLabelRemove: removeLabelFromCurrentCard,
      onLabelCreate: createLabelInCurrentBoard,
      onLabelUpdate: updateLabel,
      onLabelDelete: deleteLabel,
      onTaskCreate: createTaskInCurrentCard,
      onTaskUpdate: updateTask,
      onTaskDelete: deleteTask,
      onAttachmentCreate: createAttachmentInCurrentCard,
      onAttachmentUpdate: updateAttachment,
      onAttachmentDelete: deleteAttachment,
      onActionsFetch: fetchActionsInCurrentCard,
      onCommentActionCreate: createCommentActionInCurrentCard,
      onCommentActionUpdate: updateCommentAction,
      onCommentActionDelete: deleteCommentAction,
      push,
    },
    dispatch,
  );

const mergeProps = (stateProps, dispatchProps) => ({
  ...stateProps,
  ...omit(dispatchProps, 'push'),
  onClose: () => dispatchProps.push(Paths.BOARDS.replace(':id', stateProps.boardId)),
});

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(CardModal);
