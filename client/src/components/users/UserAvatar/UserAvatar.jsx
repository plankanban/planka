/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import initials from 'initials';
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import selectors from '../../../selectors';
import { StaticUserIds } from '../../../constants/StaticUsers';

import styles from './UserAvatar.module.scss';

const Sizes = {
  TINY: 'tiny',
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
  MASSIVE: 'massive',
};

const COLORS = [
  'emerald',
  'peter-river',
  'wisteria',
  'carrot',
  'alizarin',
  'turquoise',
  'midnight-blue',
];

const getColor = (name) => {
  let sum = 0;
  for (let i = 0; i < name.length; i += 1) {
    sum += name.charCodeAt(i);
  }

  return COLORS[sum % COLORS.length];
};

const UserAvatar = React.memo(
  ({ id, size, isDisabled, withCreatorIndicator, className, onClick }) => {
    const selectUserById = useMemo(() => selectors.makeSelectUserById(), []);

    const user = useSelector((state) => selectUserById(state, id));

    const [t] = useTranslation();

    let avatarUrl = null;
    if (user.avatar) {
      avatarUrl = user.avatar.thumbnailUrls.cover180;
    } else if (user.gravatarUrl) {
      avatarUrl = user.gravatarUrl;
    }

    const contentNode = (
      <span
        title={
          user.id === StaticUserIds.DELETED
            ? t(`common.${user.name}`, {
                context: 'title',
              })
            : user.name
        }
        className={classNames(
          styles.wrapper,
          styles[`wrapper${upperFirst(size)}`],
          onClick && styles.wrapperHoverable,
          !avatarUrl && styles[`background${upperFirst(camelCase(getColor(user.name)))}`],
        )}
        style={{
          background: avatarUrl && `url("${avatarUrl}") center / cover`,
        }}
      >
        {!avatarUrl && <span className={styles.initials}>{initials(user.name).slice(0, 2)}</span>}
        {withCreatorIndicator && <span className={styles.creatorIndicator}>+</span>}
      </span>
    );

    return onClick ? (
      <button
        data-id={id}
        type="button"
        disabled={isDisabled}
        className={classNames(styles.button, className)}
        onClick={onClick}
      >
        {contentNode}
      </button>
    ) : (
      <span className={className}>{contentNode}</span>
    );
  },
);

UserAvatar.propTypes = {
  id: PropTypes.string,
  size: PropTypes.oneOf(Object.values(Sizes)),
  isDisabled: PropTypes.bool,
  withCreatorIndicator: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

UserAvatar.defaultProps = {
  id: undefined,
  size: Sizes.MEDIUM,
  isDisabled: false,
  withCreatorIndicator: false,
  className: undefined,
  onClick: undefined,
};

export default UserAvatar;
