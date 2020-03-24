import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {
  labelsForCurrentBoardSelector,
  makeCardByIdSelector,
  makeLabelsByCardIdSelector,
  makeNotificationsTotalByCardIdSelector,
  makeTasksByCardIdSelector,
  makeUsersByCardIdSelector,
  membershipsForCurrentProjectSelector,
} from '../selectors';
import {
  addLabelToCard,
  addUserToCard,
  createLabelInCurrentBoard,
  deleteCard,
  deleteLabel,
  removeLabelFromCard,
  removeUserFromCard,
  updateLabel,
  updateCard,
} from '../actions/entry';
import Card from '../components/Card';

const makeMapStateToProps = () => {
  const cardByIdSelector = makeCardByIdSelector();
  const usersByCardIdSelector = makeUsersByCardIdSelector();
  const labelsByCardIdSelector = makeLabelsByCardIdSelector();
  const tasksByCardIdSelector = makeTasksByCardIdSelector();
  const notificationsTotalByCardIdSelector = makeNotificationsTotalByCardIdSelector();

  return (state, { id, index }) => {
    const allProjectMemberships = membershipsForCurrentProjectSelector(state);
    const allLabels = labelsForCurrentBoardSelector(state);

    const { name, dueDate, timer, isPersisted } = cardByIdSelector(state, id);

    const users = usersByCardIdSelector(state, id);
    const labels = labelsByCardIdSelector(state, id);
    const tasks = tasksByCardIdSelector(state, id);
    const notificationsTotal = notificationsTotalByCardIdSelector(state, id);

    return {
      id,
      index,
      name,
      dueDate,
      timer,
      isPersisted,
      notificationsTotal,
      users,
      labels,
      tasks,
      allProjectMemberships,
      allLabels,
    };
  };
};

const mapDispatchToProps = (dispatch, { id }) =>
  bindActionCreators(
    {
      onUpdate: (data) => updateCard(id, data),
      onDelete: () => deleteCard(id),
      onUserAdd: (userId) => addUserToCard(userId, id),
      onUserRemove: (userId) => removeUserFromCard(userId, id),
      onLabelAdd: (labelId) => addLabelToCard(labelId, id),
      onLabelRemove: (labelId) => removeLabelFromCard(labelId, id),
      onLabelCreate: (data) => createLabelInCurrentBoard(data),
      onLabelUpdate: (labelId, data) => updateLabel(labelId, data),
      onLabelDelete: (labelId) => deleteLabel(labelId),
    },
    dispatch,
  );

export default connect(makeMapStateToProps, mapDispatchToProps)(Card);
