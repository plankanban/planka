import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { withPopup } from '../../../lib/popup';
import { Popup } from '../../../lib/custom-ui';

import UserItem from './UserItem';

import styles from './AddPopup.module.scss';

const AddStep = React.memo(({ users, currentUserIds, title, onCreate, onClose }) => {
  const [t] = useTranslation();

  const handleUserSelect = useCallback(
    (id) => {
      onCreate({
        userId: id,
      });

      onClose();
    },
    [onCreate, onClose],
  );

  return (
    <>
      <Popup.Header>
        {t(title, {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <div className={styles.menu}>
          {users.map((user) => (
            <UserItem
              key={user.id}
              name={user.name}
              avatarUrl={user.avatarUrl}
              isActive={currentUserIds.includes(user.id)}
              onSelect={() => handleUserSelect(user.id)}
            />
          ))}
        </div>
      </Popup.Content>
    </>
  );
});

AddStep.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  users: PropTypes.array.isRequired,
  currentUserIds: PropTypes.array.isRequired,
  /* eslint-disable react/forbid-prop-types */
  title: PropTypes.string,
  onCreate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

AddStep.defaultProps = {
  title: 'common.addMember',
};

export default withPopup(AddStep);
