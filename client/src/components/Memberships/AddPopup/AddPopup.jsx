import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { withPopup } from '../../../lib/popup';
import { Input, Popup } from '../../../lib/custom-ui';

import { useField } from '../../../hooks';
import UserItem from './UserItem';

import styles from './AddPopup.module.scss';

const AddStep = React.memo(({ users, currentUserIds, title, onCreate, onClose }) => {
  const [t] = useTranslation();
  const [searchValue, handleSearchFieldChange] = useField('');
  const search = useMemo(() => searchValue.trim().toLowerCase(), [searchValue]);

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          user.email.includes(search) ||
          user.name.toLowerCase().includes(search) ||
          (user.username && user.username.includes(search)),
      ),
    [users, search],
  );

  const searchField = useRef(null);

  const handleUserSelect = useCallback(
    (id) => {
      onCreate({
        userId: id,
      });

      onClose();
    },
    [onCreate, onClose],
  );

  useEffect(() => {
    searchField.current.focus();
  }, []);

  return (
    <>
      <Popup.Header>
        {t(title, {
          context: 'title',
        })}
      </Popup.Header>
      <Popup.Content>
        <Input
          fluid
          ref={searchField}
          value={searchValue}
          placeholder={t('common.searchUsers')}
          icon="search"
          onChange={handleSearchFieldChange}
        />
        {filteredUsers.length > 0 && (
          <div className={styles.users}>
            {filteredUsers.map((user) => (
              <UserItem
                key={user.id}
                name={user.name}
                avatarUrl={user.avatarUrl}
                isActive={currentUserIds.includes(user.id)}
                onSelect={() => handleUserSelect(user.id)}
              />
            ))}
          </div>
        )}
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
