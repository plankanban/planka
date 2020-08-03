import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { withPopup } from '../../../lib/popup';
import { Popup } from '../../../lib/custom-ui';

import UserItem from './UserItem';

import styles from './MembershipAddPopup.module.scss';

const MembershipAddStep = React.memo(({ users, currentUserIds, onCreate, onClose }) => {
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
        {t('common.addMember', {
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

MembershipAddStep.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  users: PropTypes.array.isRequired,
  currentUserIds: PropTypes.array.isRequired,
  /* eslint-disable react/forbid-prop-types */
  onCreate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withPopup(MembershipAddStep);
