import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { allUsersExceptCurrentSelector } from '../selectors';
import { closeModal, deleteUser, updateUser } from '../actions/entry';
import UsersModal from '../components/UsersModal';

const mapStateToProps = state => {
  const items = allUsersExceptCurrentSelector(state);

  return {
    items,
  };
};

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      onUpdate: updateUser,
      onDelete: deleteUser,
      onClose: closeModal,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(UsersModal);
