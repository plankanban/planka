import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import styles from './Tag.module.scss';
import UserItem from '../Memberships/AddStep/UserItem';

export const TagRegex = /(^|\s)@/gi;

const Tag = React.memo(({ search, boardMemberships }) => {
  const cleanSearch = useMemo(() => search.trim().toLowerCase(), [search]);

  const filteredUsers = useMemo(
    () =>
      boardMemberships.filter(
        (member) =>
          member.user.email.includes(cleanSearch) ||
          member.user.name.toLowerCase().includes(cleanSearch) ||
          (member.user.username && member.user.username.includes(cleanSearch)),
      ),
    [boardMemberships, cleanSearch],
  );

  return (
    <div className={classNames(styles.container)}>
      {filteredUsers.map((member) => {
        return (
          <UserItem
            key={member.user.id}
            name={member.user.name}
            avatarUrl={member.user.avatarUrl}
            onSelect={() => handleUserSelect(member.user.id)}
          />
        );
      })}
    </div>
  );
});

Tag.defaultProps = {
  search: '',
};

Tag.propTypes = {
  search: PropTypes.string,
  boardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default Tag;
