/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { Button, Icon } from 'semantic-ui-react';

import selectors from '../../../../selectors';
import { usePopupInClosableContext } from '../../../../hooks';
import { isListArchiveOrTrash } from '../../../../utils/record-helpers';
import { BoardMembershipRoles } from '../../../../constants/Enums';
import CustomFieldGroup from '../../../custom-field-groups/CustomFieldGroup';
import CustomFieldGroupStep from '../../../custom-field-groups/CustomFieldGroupStep';

import styles from './Item.module.scss';

const Item = React.memo(({ id, dragHandleProps }) => {
  const selectCustomFieldGroupById = useMemo(() => selectors.makeSelectCustomFieldGroupById(), []);
  const selectListById = useMemo(() => selectors.makeSelectListById(), []);

  const customFieldGroup = useSelector((state) => selectCustomFieldGroupById(state, id));

  const canEdit = useSelector((state) => {
    if (customFieldGroup.boardId) {
      return false;
    }

    const { listId } = selectors.selectCurrentCard(state);
    const list = selectListById(state, listId);

    if (isListArchiveOrTrash(list)) {
      return false;
    }

    const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
    return !!boardMembership && boardMembership.role === BoardMembershipRoles.EDITOR;
  });

  const CustomFieldGroupPopup = usePopupInClosableContext(CustomFieldGroupStep);

  return (
    <div className={styles.wrapper}>
      <div className={styles.moduleWrapper}>
        <Icon name="sticky note outline" className={styles.moduleIcon} />
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <div {...dragHandleProps}>
          <div className={classNames(styles.moduleHeader, canEdit && styles.moduleHeaderEditable)}>
            {customFieldGroup.isPersisted && canEdit && (
              <CustomFieldGroupPopup id={customFieldGroup.id}>
                <Button className={styles.editButton}>
                  <Icon fitted name="pencil" size="small" />
                </Button>
              </CustomFieldGroupPopup>
            )}
            <span className={styles.moduleHeaderTitle}>{customFieldGroup.name}</span>
          </div>
        </div>
        <CustomFieldGroup id={id} />
      </div>
    </div>
  );
});

Item.propTypes = {
  id: PropTypes.string.isRequired,
  dragHandleProps: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

Item.defaultProps = {
  dragHandleProps: undefined,
};

export default Item;
