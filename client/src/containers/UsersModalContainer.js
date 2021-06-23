import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { usersExceptCurrentSelector } from '../selectors';
import { closeModal, deleteUser, updateUser } from '../actions/entry';
import UsersModal from '../components/UsersModal';

const mapStateToProps = (state) => {
  const users = usersExceptCurrentSelector(state);

  return {
    items: users,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onUpdate: updateUser,
      onDelete: deleteUser,
      onClose: closeModal,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(UsersModal);
