import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Menu } from 'semantic-ui-react';
import { Popup } from '../../lib/custom-ui';

import Item from './Item';

import styles from './BoardMembershipsStep.module.scss';

const BoardMembershipsStep = React.memo(
  ({ items, currentUserIds, title, onUserSelect, onUserDeselect, onBack }) => {
    const [t] = useTranslation();

    const handleUserSelect = useCallback(
      (id) => {
        onUserSelect(id);
      },
      [onUserSelect],
    );

    const handleUserDeselect = useCallback(
      (id) => {
        onUserDeselect(id);
      },
      [onUserDeselect],
    );

    return (
      <>
        <Popup.Header onBack={onBack}>{t(title)}</Popup.Header>
        <Popup.Content>
          <Menu secondary vertical className={styles.menu}>
            {items.map((item) => (
              <Item
                key={item.id}
                isPersisted={item.isPersisted}
                isActive={currentUserIds.includes(item.user.id)}
                user={item.user}
                onUserSelect={() => handleUserSelect(item.user.id)}
                onUserDeselect={() => handleUserDeselect(item.user.id)}
              />
            ))}
          </Menu>
        </Popup.Content>
      </>
    );
  },
);

BoardMembershipsStep.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  items: PropTypes.array.isRequired,
  currentUserIds: PropTypes.array.isRequired,
  /* eslint-enable react/forbid-prop-types */
  title: PropTypes.string,
  onUserSelect: PropTypes.func.isRequired,
  onUserDeselect: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

BoardMembershipsStep.defaultProps = {
  title: 'common.members',
  onBack: undefined,
};

export default BoardMembershipsStep;
