import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import omit from 'lodash/omit';

import {
  actionsForCurrentCardSelector,
  currentCardSelector,
  currentUserSelector,
  labelsForCurrentBoardSelector,
  labelsForCurrentCardSelector,
  membershipsForCurrentProjectSelector,
  tasksForCurrentCardSelector,
  usersForCurrentCardSelector,
} from '../selectors';
import {
  addLabelToCurrentCard,
  addUserToCurrentCard,
  createCommentActionInCurrentCard,
  createLabelInCurrentBoard,
  createTaskInCurrentCard,
  deleteCommentAction,
  deleteCurrentCard,
  deleteLabel,
  deleteTask,
  fetchActionsInCurrentCard,
  removeLabelFromCurrentCard,
  removeUserFromCurrentCard,
  updateCommentAction,
  updateCurrentCard,
  updateLabel,
  updateTask,
} from '../actions/entry';
import Paths from '../constants/Paths';
import CardModal from '../components/CardModal';

const mapStateToProps = (state) => {
  const { isAdmin } = currentUserSelector(state);
  const allProjectMemberships = membershipsForCurrentProjectSelector(state);
  const allLabels = labelsForCurrentBoardSelector(state);

  const {
    name,
    description,
    dueDate,
    timer,
    isSubscribed,
    isActionsFetching,
    isAllActionsFetched,
    boardId,
  } = currentCardSelector(state);

  const users = usersForCurrentCardSelector(state);
  const labels = labelsForCurrentCardSelector(state);
  const tasks = tasksForCurrentCardSelector(state);
  const actions = actionsForCurrentCardSelector(state);

  return {
    name,
    description,
    dueDate,
    timer,
    isSubscribed,
    isActionsFetching,
    isAllActionsFetched,
    users,
    labels,
    tasks,
    actions,
    allProjectMemberships,
    allLabels,
    boardId,
    isEditable: isAdmin,
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    onUpdate: updateCurrentCard,
    onDelete: deleteCurrentCard,
    onUserAdd: addUserToCurrentCard,
    onUserRemove: removeUserFromCurrentCard,
    onLabelAdd: addLabelToCurrentCard,
    onLabelRemove: removeLabelFromCurrentCard,
    onLabelCreate: createLabelInCurrentBoard,
    onLabelUpdate: updateLabel,
    onLabelDelete: deleteLabel,
    onTaskCreate: createTaskInCurrentCard,
    onTaskUpdate: updateTask,
    onTaskDelete: deleteTask,
    onActionsFetch: fetchActionsInCurrentCard,
    onCommentActionCreate: createCommentActionInCurrentCard,
    onCommentActionUpdate: updateCommentAction,
    onCommentActionDelete: deleteCommentAction,
    push,
  },
  dispatch,
);

const mergeProps = (stateProps, dispatchProps) => ({
  ...omit(stateProps, 'boardId'),
  ...omit(dispatchProps, 'push'),
  onClose: () => dispatchProps.push(Paths.BOARDS.replace(':id', stateProps.boardId)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
)(CardModal);
